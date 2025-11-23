from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
import uuid

# Event base schema
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    recurrence_rule: Optional[str] = None

# Schema for creating events
class EventCreate(EventBase):
    calendar_id: int
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

# Schema for updating events
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if v is not None and 'start_time' in values and values['start_time'] is not None:
            if v <= values['start_time']:
                raise ValueError('End time must be after start time')
        return v

# Schema for event response
class EventResponse(EventBase):
    id: int
    calendar_id: int
    uid: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Schema for event query parameters
class EventQuery(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    calendar_ids: Optional[list[int]] = None
