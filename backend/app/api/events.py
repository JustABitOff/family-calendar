from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.models.event import Event
from app.models.calendar import Calendar
from app.schemas.event import EventResponse, EventCreate, EventUpdate

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

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event_data: EventCreate, db: Session = Depends(get_db)):
    """
    Create a new event. Only allowed for local calendars.
    """
    # Check if calendar exists and is local
    calendar = db.query(Calendar).filter(Calendar.id == event_data.calendar_id).first()
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    if not calendar.is_local:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Events can only be created in local calendars"
        )
    
    # Create the event
    event = Event(
        calendar_id=event_data.calendar_id,
        title=event_data.title,
        description=event_data.description,
        location=event_data.location,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        all_day=event_data.all_day,
        recurrence_rule=event_data.recurrence_rule,
        uid=str(uuid.uuid4())  # Generate unique ID for local events
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, event_data: EventUpdate, db: Session = Depends(get_db)):
    """
    Update an existing event. Only allowed for events in local calendars.
    """
    # Get the event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if the event's calendar is local
    calendar = db.query(Calendar).filter(Calendar.id == event.calendar_id).first()
    if not calendar or not calendar.is_local:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only events in local calendars can be modified"
        )
    
    # Update the event fields
    update_data = event_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    event.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(event)
    
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Delete an event. Only allowed for events in local calendars.
    """
    # Get the event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if the event's calendar is local
    calendar = db.query(Calendar).filter(Calendar.id == event.calendar_id).first()
    if not calendar or not calendar.is_local:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only events in local calendars can be deleted"
        )
    
    db.delete(event)
    db.commit()
    
    return None
