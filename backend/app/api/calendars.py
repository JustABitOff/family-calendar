from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.calendar import Calendar
from app.schemas.calendar import CalendarCreate, CalendarResponse, CalendarUpdate
from app.services.refresh_service import RefreshService

router = APIRouter()

@router.post("/", response_model=CalendarResponse, status_code=status.HTTP_201_CREATED)
async def create_calendar(calendar: CalendarCreate, db: Session = Depends(get_db)):
    """
    Create a new calendar from an iCal URL or create a local calendar.
    """
    # For local calendars, skip URL validation and refresh
    if calendar.is_local:
        # Check if a local calendar with this name already exists
        existing_local = db.query(Calendar).filter(
            Calendar.name == calendar.name,
            Calendar.is_local == True
        ).first()
        if existing_local:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Local calendar with this name already exists"
            )
        
        # Create local calendar
        db_calendar = Calendar(
            name=calendar.name,
            url=None,
            color=calendar.color,
            is_local=True
        )
        db.add(db_calendar)
        db.commit()
        db.refresh(db_calendar)
        
        return db_calendar
    
    # For non-local calendars, check URL uniqueness and refresh
    existing_calendar = db.query(Calendar).filter(Calendar.url == calendar.url).first()
    if existing_calendar:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Calendar with this URL already exists"
        )
    
    # Create new calendar
    db_calendar = Calendar(
        name=calendar.name,
        url=calendar.url,
        color=calendar.color,
        is_local=False
    )
    db.add(db_calendar)
    db.commit()
    db.refresh(db_calendar)
    
    # Refresh the calendar to fetch events (async)
    await RefreshService.refresh_calendar(db, db_calendar.id)
    
    return db_calendar

@router.get("/", response_model=List[CalendarResponse])
def get_calendars(db: Session = Depends(get_db)):
    """
    Get all calendars.
    """
    calendars = db.query(Calendar).all()
    return calendars

@router.get("/{calendar_id}", response_model=CalendarResponse)
def get_calendar(calendar_id: int, db: Session = Depends(get_db)):
    """
    Get a specific calendar by ID.
    """
    calendar = db.query(Calendar).filter(Calendar.id == calendar_id).first()
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    return calendar

@router.delete("/{calendar_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_calendar(calendar_id: int, db: Session = Depends(get_db)):
    """
    Delete a calendar and all its events.
    """
    calendar = db.query(Calendar).filter(Calendar.id == calendar_id).first()
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    db.delete(calendar)
    db.commit()
    
    return None

@router.post("/{calendar_id}/refresh", status_code=status.HTTP_200_OK)
async def refresh_calendar(calendar_id: int, db: Session = Depends(get_db)):
    """
    Manually refresh a calendar to fetch the latest events.
    """
    calendar = db.query(Calendar).filter(Calendar.id == calendar_id).first()
    if not calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    success = await RefreshService.refresh_calendar(db, calendar_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh calendar"
        )
    
    return {"message": "Calendar refreshed successfully"}

@router.post("/refresh-all", status_code=status.HTTP_200_OK)
async def refresh_all_calendars(db: Session = Depends(get_db)):
    """
    Manually refresh all calendars to fetch the latest events.
    """
    results = await RefreshService.refresh_all_calendars(db)
    return results

@router.patch("/{calendar_id}", response_model=CalendarResponse)
def update_calendar(calendar_id: int, calendar_update: CalendarUpdate, db: Session = Depends(get_db)):
    """
    Update a calendar's properties.
    """
    db_calendar = db.query(Calendar).filter(Calendar.id == calendar_id).first()
    if not db_calendar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar not found"
        )
    
    # Update calendar properties
    update_data = calendar_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_calendar, key, value)
    
    db.commit()
    db.refresh(db_calendar)
    
    return db_calendar

@router.get("/local/default", response_model=CalendarResponse)
def get_or_create_local_calendar(db: Session = Depends(get_db)):
    """
    Get the default local calendar, creating it if it doesn't exist.
    """
    # Look for existing local calendar
    local_calendar = db.query(Calendar).filter(Calendar.is_local == True).first()
    
    if local_calendar:
        return local_calendar
    
    # Create default local calendar if none exists
    local_calendar = Calendar(
        name="Local Events",
        url=None,
        color="#52c41a",  # Green color to distinguish from imported calendars
        is_local=True
    )
    db.add(local_calendar)
    db.commit()
    db.refresh(local_calendar)
    
    return local_calendar
