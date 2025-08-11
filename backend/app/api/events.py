from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.event import Event
from app.schemas.event import EventResponse

router = APIRouter()

@router.get("/", response_model=List[EventResponse])
def get_events(
    start_date: Optional[datetime] = Query(None, description="Filter events starting from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter events ending before this date"),
    calendar_id: Optional[int] = Query(None, description="Filter events by calendar ID"),
    db: Session = Depends(get_db)
):
    """
    Get events with optional filtering by date range and calendar.
    """
    query = db.query(Event)
    
    # Apply filters if provided
    if start_date:
        query = query.filter(Event.end_time >= start_date)
    
    if end_date:
        query = query.filter(Event.start_time <= end_date)
    
    if calendar_id:
        query = query.filter(Event.calendar_id == calendar_id)
    
    # Default to events in the next 30 days if no date filters provided
    if not start_date and not end_date:
        now = datetime.utcnow()
        query = query.filter(Event.end_time >= now)
        query = query.filter(Event.start_time <= now + timedelta(days=30))
    
    # Order by start time
    query = query.order_by(Event.start_time)
    
    events = query.all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """
    Get a specific event by ID.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event
