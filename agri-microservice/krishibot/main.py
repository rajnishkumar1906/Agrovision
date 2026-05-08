from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create FastAPI app
app = FastAPI(
    title="KrishiBot API",
    description="Voice-enabled RAG system for farmers",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "KrishiBot API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "ask_text": "/api/ask-text",
            "ask_voice": "/api/ask-voice",
            "health": "/api/health",
            "languages": "/api/languages"
        }
    }

@app.on_event("shutdown")
def cleanup():
    """Cleanup temporary files on shutdown"""
    import shutil
    if os.path.exists("temp_audio"):
        shutil.rmtree("temp_audio", ignore_errors=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True
    )