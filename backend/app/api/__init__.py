from fastapi import APIRouter

from app.api.calendars import router as calendars_router
from app.api.events import router as events_router

# Create main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(calendars_router, prefix="/calendars", tags=["calendars"])
api_router.include_router(events_router, prefix="/events", tags=["events"])
