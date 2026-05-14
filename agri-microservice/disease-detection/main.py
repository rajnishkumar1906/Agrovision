from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from app.routes.detection_routes import router as detection_router
from app.services.detection_service import DiseaseDetectionService

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for startup and shutdown events.
    """
    # The DiseaseDetectionService is initialized in the routes module,
    # but we could also initialize it here and inject it if needed.
    yield

# Initialize FastAPI app
app = FastAPI(
    title="Crop Disease Detection Service",
    version="1.0.0",
    description="Image-based crop disease detection microservice",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(detection_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
