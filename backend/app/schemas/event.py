from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Event base schema
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    recurrence_rule: Optional[str] = None

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
