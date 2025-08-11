from pydantic import BaseModel, HttpUrl, validator
from typing import Optional, List
from datetime import datetime

# Calendar base schema
class CalendarBase(BaseModel):
    name: str
    url: str
    
    @validator('url')
    def url_must_be_valid(cls, v):
        # Simple validation - could be enhanced
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

# Schema for creating a calendar
class CalendarCreate(CalendarBase):
    color: Optional[str] = "#3174ad"  # Default blue color
    
    @validator('color')
    def color_must_be_hex(cls, v):
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Color must be a valid hex color code (e.g., #3174ad)')
        try:
            int(v[1:], 16)
        except ValueError:
            raise ValueError('Color must be a valid hex color code (e.g., #3174ad)')
        return v

# Schema for calendar response
class CalendarResponse(CalendarBase):
    id: int
    color: str
    created_at: datetime
    updated_at: datetime
    last_refreshed: Optional[datetime] = None
    
    class Config:
        orm_mode = True
