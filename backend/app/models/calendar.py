from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Calendar(Base):
    __tablename__ = "calendars"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(Text, nullable=True)  # Nullable for local calendars
    color = Column(String(7), nullable=False)
    is_local = Column(Boolean, default=False)  # True for local calendars
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_refreshed = Column(DateTime, nullable=True)
    
    # Relationship with events
    events = relationship("Event", back_populates="calendar", cascade="all, delete-orphan")
