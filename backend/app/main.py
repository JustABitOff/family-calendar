from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api import api_router
from app.core.config import settings
from app.services.refresh_service import RefreshService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Family Calendar API")
    # Schedule calendar refresh job
    RefreshService.schedule_refresh_job(interval_minutes=5)

# Shutdown event
@app.on_event("shutdown")
def shutdown_event():
    logger.info("Shutting down Family Calendar API")
    # Shutdown scheduler
    RefreshService.shutdown()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
