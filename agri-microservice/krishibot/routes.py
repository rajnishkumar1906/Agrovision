from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Request, BackgroundTasks
from fastapi.responses import FileResponse
from typing import Optional
import os
import uuid
import logging
import time
import asyncio
from container import rag_pipeline

router = APIRouter()

# Create directories
TEMP_DIR = "temp_audio"
AUDIO_OUTPUT_DIR = "audio_output"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)
os.makedirs("static", exist_ok=True)

# Initialize voice service
voice_service = None
try:
    from voice.voice_service import VoiceService
    voice_service = VoiceService()
    logging.info("Voice service loaded")
except Exception as e:
    logging.warning(f"Voice service not available: {e}")

def generate_audio_background(text: str, filename: str, language: str):
    """Background task to generate audio without blocking the response"""
    if voice_service and text:
        try:
            start_time = time.time()
            voice_service.set_language(language)
            voice_service.generate_audio(text, filename)
            logging.info(f"Background audio generation took {time.time() - start_time:.2f}s for {filename}")
        except Exception as e:
            logging.error(f"Background voice generation failed: {e}")

# ============ TEXT ENDPOINT ============
@router.post("/ask-text")
async def ask_text(request: Request, background_tasks: BackgroundTasks):
    """Ask KrishiBot a question via text"""
    try:
        query = None
        language = "en"
        gender = "male"
        
        # Try query parameter
        query = request.query_params.get("query")
        language = request.query_params.get("language", "en")
        gender = request.query_params.get("gender", "male")
        
        # Try JSON body
        if not query:
            try:
                body = await request.json()
                query = body.get("query")
                language = body.get("language", language)
                gender = body.get("gender", gender)
            except:
                pass
        
        # Try form data
        if not query:
            try:
                form = await request.form()
                query = form.get("query")
                language = form.get("language", language)
                gender = form.get("gender", gender)
            except:
                pass
        
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        logging.info(f"Text query: {query} (lang: {language}, gender: {gender})")
        
        # Get answer from RAG pipeline
        result = rag_pipeline.run(query, preferred_language=language, gender=gender)
        answer = result["answer"]
        
        # Start audio generation in background
        audio_filename = None
        if voice_service:
            temp_id = str(uuid.uuid4())
            audio_filename = f"{temp_id}_output.mp3"
            background_tasks.add_task(generate_audio_background, answer, audio_filename, language)
        
        return {
            "success": True,
            "status": "success",
            "answer": answer,
            "query": query,
            "audio_file": audio_filename,
            "data": {
                "answer": answer,
                "query": query,
                "audio_file": audio_filename,
                "status": "success"
            }
        }
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Text query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ VOICE ENDPOINT ============
@router.post("/ask-voice")
async def ask_voice(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: Optional[str] = Query("hi", description="Response language"),
    gender: Optional[str] = Query("male", description="User gender")
):
    """Ask KrishiBot a question via voice"""
    
    if not voice_service:
        raise HTTPException(status_code=503, detail="Voice service not available")
    
    temp_audio_path = None
    
    try:
        # Save uploaded audio
        temp_id = str(uuid.uuid4())
        temp_audio_path = os.path.join(TEMP_DIR, f"{temp_id}.wav")
        
        content = await file.read()
        with open(temp_audio_path, "wb") as f:
            f.write(content)
        
        # Set language
        voice_service.set_language(language)
        
        # Convert speech to text (This is the only blocking voice part)
        query = voice_service.process_audio(temp_audio_path)
        
        if query == "ERROR_FFMPEG_MISSING":
            return {
                "success": False,
                "status": "error",
                "message": "Voice processing is temporarily unavailable on this server (FFmpeg missing). Please use text chat instead.",
                "data": {"status": "error"}
            }
            
        if not query:
            raise HTTPException(status_code=400, detail="Could not understand audio")
        
        logging.info(f"Voice query: {query} (gender: {gender})")
        
        # Get answer
        result = rag_pipeline.run(query, preferred_language=language, gender=gender)
        answer = result["answer"]
        
        # Start audio generation in background
        audio_filename = f"{temp_id}_output.mp3"
        background_tasks.add_task(generate_audio_background, answer, audio_filename, language)
        
        return {
            "success": True,
            "status": "success",
            "query": query,
            "answer": answer,
            "audio_file": audio_filename,
            "data": {
                "query": query,
                "answer": answer,
                "audio_file": audio_filename,
                "status": "success"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Voice query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


# ============ GET AUDIO ============
@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """Get generated audio file with a short wait if it's still being generated"""
    # Check all possible locations for the audio file
    search_paths = [
        os.path.join(TEMP_DIR, filename),
        os.path.join(AUDIO_OUTPUT_DIR, filename),
        os.path.join("static", filename),
        filename  # maybe it's a full path
    ]
    
    # Wait up to 10 seconds for the file to exist (for background generation)
    max_retries = 20
    retry_interval = 0.5
    
    for _ in range(max_retries):
        for path in search_paths:
            if os.path.exists(path) and os.path.isfile(path):
                # Ensure the file is completely written (not zero size)
                if os.path.getsize(path) > 0:
                    return FileResponse(path, media_type="audio/mpeg")
        
        # If not found, wait and try again
        await asyncio.sleep(retry_interval)
    
    logging.error(f"Audio not found or generation timed out: {filename}")
    raise HTTPException(status_code=404, detail="Audio not found")


# ============ HEALTH CHECK ============
@router.get("/health")
def health_check():
    """Check if KrishiBot is ready"""
    return {
        "status": "healthy",
        "bot": "KrishiBot",
        "voice_available": voice_service is not None,
        "rag_ready": rag_pipeline is not None
    }


# ============ LANGUAGES ============
@router.get("/languages")
def get_languages():
    """Get supported languages for voice"""
    if voice_service:
        return voice_service.get_supported_languages()
    return {
        "hi": "Hindi",
        "en": "English", 
        "ta": "Tamil",
        "te": "Telugu",
        "mr": "Marathi",
        "bn": "Bengali"
    }