from pydantic import BaseModel, HttpUrl, validator
from typing import Optional, List
from datetime import datetime

# Calendar base schema
class CalendarBase(BaseModel):
    name: str
    url: Optional[str] = None
    is_local: Optional[bool] = False
    
    @validator('url')
    def url_must_be_valid(cls, v, values):
        # Skip validation for local calendars
        if values.get('is_local', False):
            return v
        # For non-local calendars, URL is required and must be valid
        if v is None:
            raise ValueError('URL is required for non-local calendars')
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

# Schema for updating a calendar
class CalendarUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    
    @validator('color')
    def color_must_be_hex(cls, v):
        if v is None:
            return v
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Color must be a valid hex color code (e.g., #3174ad)')
        try:
            int(v[1:], 16)
        except ValueError:
            raise ValueError('Color must be a valid hex color code (e.g., #3174ad)')
        return v

# Schema for calendar response
class CalendarResponse(BaseModel):
    id: int
    name: str
    url: Optional[str] = None
    is_local: Optional[bool] = False
    color: str
    created_at: datetime
    updated_at: datetime
    last_refreshed: Optional[datetime] = None
    
    class Config:
        orm_mode = True
