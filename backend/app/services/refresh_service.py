from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from typing import List, Optional

from app.models.calendar import Calendar
from app.models.event import Event
from app.services.ical_service import ICalService

logger = logging.getLogger(__name__)

class RefreshService:
    _scheduler: Optional[AsyncIOScheduler] = None
    
    @classmethod
    def get_scheduler(cls) -> AsyncIOScheduler:
        """Get or create the scheduler instance"""
        if cls._scheduler is None:
            cls._scheduler = AsyncIOScheduler()
            # Start the scheduler if it's not running
            if not cls._scheduler.running:
                cls._scheduler.start()
        return cls._scheduler
    
    @classmethod
    async def refresh_calendar(cls, db: Session, calendar_id: int) -> bool:
        """Refresh a single calendar by ID"""
        try:
            # Get the calendar from the database
            calendar = db.query(Calendar).filter(Calendar.id == calendar_id).first()
            if not calendar:
                logger.error(f"Calendar with ID {calendar_id} not found")
                return False
            
            # Fetch and parse the iCal data
            new_events = await ICalService.fetch_and_parse_calendar(calendar.url, calendar.id)
            if not new_events:
                logger.warning(f"No events found for calendar {calendar.name} (ID: {calendar_id})")
                # Update last_refreshed even if no events found
                calendar.last_refreshed = datetime.utcnow()
                db.commit()
                return True
            
            # Process events in batches to avoid constraint violations
            try:
                # Get existing event UIDs for this calendar
                existing_events = db.query(Event.uid).filter(Event.calendar_id == calendar_id).all()
                existing_uids = {event.uid for event in existing_events}
                
                # Track processed UIDs to avoid duplicates in the same batch
                processed_uids = set()
                
                # Process each event individually
                for event_data in new_events:
                    uid = event_data.get('uid')
                    
                    # Skip if we've already processed this UID in this batch
                    if uid in processed_uids:
                        continue
                    
                    processed_uids.add(uid)
                    
                    # Check if event already exists
                    if uid in existing_uids:
                        # Update existing event
                        db.query(Event).filter(
                            Event.calendar_id == calendar_id,
                            Event.uid == uid
                        ).update(event_data)
                    else:
                        # Add new event
                        event = Event(**event_data)
                        db.add(event)
                
                # Update last_refreshed timestamp
                calendar.last_refreshed = datetime.utcnow()
                db.commit()
                
                logger.info(f"Successfully refreshed calendar {calendar.name} (ID: {calendar_id}) with {len(new_events)} events")
                return True
            except Exception as inner_e:
                db.rollback()
                logger.error(f"Error processing events for calendar {calendar_id}: {str(inner_e)}")
                
                # Fallback to the delete-all-and-insert approach
                logger.info(f"Trying fallback method for calendar {calendar_id}")
                
                # Delete all existing events and commit the deletion
                db.query(Event).filter(Event.calendar_id == calendar_id).delete()
                db.commit()
                
                # Track processed UIDs to avoid duplicates in the fallback method too
                processed_uids = set()
                success_count = 0
                
                # Add each event individually to identify problematic events
                for event_data in new_events:
                    uid = event_data.get('uid')
                    
                    # Skip if we've already processed this UID
                    if uid in processed_uids:
                        continue
                    
                    processed_uids.add(uid)
                    
                    try:
                        event = Event(**event_data)
                        db.add(event)
                        db.commit()  # Commit each event individually
                        success_count += 1
                    except Exception as e:
                        db.rollback()  # Rollback only this specific event
                        logger.error(f"Failed to add event {uid}: {str(e)}")
                        # Continue with next event
                
                if success_count > 0:
                    # Update last_refreshed timestamp
                    calendar.last_refreshed = datetime.utcnow()
                    db.commit()
                    logger.info(f"Fallback method added {success_count} of {len(new_events)} events for calendar {calendar_id}")
                    return True
                else:
                    logger.error(f"Fallback method failed to add any events for calendar {calendar_id}")
                    return False
        except Exception as e:
            db.rollback()
            logger.error(f"Error refreshing calendar {calendar_id}: {str(e)}")
            return False
    
    @classmethod
    async def refresh_all_calendars(cls, db: Session) -> dict:
        """Refresh all calendars"""
        results = {"success": 0, "failed": 0, "calendars": []}
        
        # Get all calendars
        calendars = db.query(Calendar).all()
        
        for calendar in calendars:
            success = await cls.refresh_calendar(db, calendar.id)
            if success:
                results["success"] += 1
                results["calendars"].append({
                    "id": calendar.id,
                    "name": calendar.name,
                    "status": "success"
                })
            else:
                results["failed"] += 1
                results["calendars"].append({
                    "id": calendar.id,
                    "name": calendar.name,
                    "status": "failed"
                })
        
        return results
    
    @classmethod
    def schedule_refresh_job(cls, interval_minutes: int = 5):
        """Schedule a job to refresh all calendars periodically"""
        scheduler = cls.get_scheduler()
        
        # Add the job if it doesn't exist
        if not scheduler.get_job("refresh_all_calendars"):
            from app.core.database import SessionLocal
            
            async def refresh_job():
                db = SessionLocal()
                try:
                    await cls.refresh_all_calendars(db)
                finally:
                    db.close()
            
            scheduler.add_job(
                refresh_job,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id="refresh_all_calendars",
                replace_existing=True
            )
            
            logger.info(f"Scheduled calendar refresh job to run every {interval_minutes} minutes")
    
    @classmethod
    def shutdown(cls):
        """Shutdown the scheduler"""
        if cls._scheduler and cls._scheduler.running:
            cls._scheduler.shutdown()
            cls._scheduler = None
