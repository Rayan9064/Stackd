import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database and Scheduler
from backend.db import db
from backend.scheduler import scheduler, setup_scheduler

# Routers
from backend.routes.news import router as news_router
from backend.routes.launches import router as launches_router
from backend.routes.jobs import router as jobs_router
from backend.routes.startups import router as startups_router
from backend.routes.digest import router as digest_router

logger = logging.getLogger("main")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up FastAPI application...")
    
    # 1. Connect database
    try:
        await db.connect()
        logger.info("Database connected successfully.")
    except Exception as e:
        logger.error(f"Failed to connect database at startup: {e}")
        
    # 2. Setup and start scheduler
    try:
        setup_scheduler()
        scheduler.start()
        logger.info("Scheduler started successfully.")
    except Exception as e:
        logger.error(f"Failed to start scheduler at startup: {e}")
        
    yield
    
    # Shutdown actions
    logger.info("Shutting down FastAPI application...")
    
    # 1. Shutdown scheduler
    try:
        scheduler.shutdown()
        logger.info("Scheduler shut down successfully.")
    except Exception as e:
        logger.error(f"Failed to shut down scheduler: {e}")
        
    # 2. Disconnect database
    try:
        await db.disconnect()
        logger.info("Database disconnected successfully.")
    except Exception as e:
        logger.error(f"Failed to disconnect database: {e}")

app = FastAPI(
    title="Stackd Backend API",
    description="Ecosystem Aggregator for Indian Startup Community",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for the aggregator API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(news_router)
app.include_router(launches_router)
app.include_router(jobs_router)
app.include_router(startups_router) # also serves cohorts and investors
app.include_router(digest_router)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
