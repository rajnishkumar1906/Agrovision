from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Request
from fastapi.responses import FileResponse
from typing import Optional
import os
import uuid
import logging
from container import rag_pipeline

router = APIRouter()

# Create directories
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs("static", exist_ok=True)

# Initialize voice service
voice_service = None
try:
    from voice.voice_service import VoiceService
    voice_service = VoiceService()
    logging.info("Voice service loaded")
except Exception as e:
    logging.warning(f"Voice service not available: {e}")

# ============ TEXT ENDPOINT ============
@router.post("/ask-text")
async def ask_text(request: Request):
    """Ask KrishiBot a question via text"""
    try:
        query = None
        
        # Try query parameter
        query = request.query_params.get("query")
        
        # Try JSON body
        if not query:
            try:
                body = await request.json()
                query = body.get("query")
            except:
                pass
        
        # Try form data
        if not query:
            try:
                form = await request.form()
                query = form.get("query")
            except:
                pass
        
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        logging.info(f"Text query: {query}")
        
        # Get answer from RAG pipeline
        result = rag_pipeline.run(query)
        
        return {
            "success": True,
            "status": "success",
            "answer": result["answer"],
            "query": query,
            "data": {
                "answer": result["answer"],
                "query": query,
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
    file: UploadFile = File(...),
    language: Optional[str] = Query("hi", description="Response language")
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
        
        # Convert speech to text
        query = voice_service.process_audio(temp_audio_path)
        
        if not query:
            raise HTTPException(status_code=400, detail="Could not understand audio")
        
        logging.info(f"Voice query: {query}")
        
        # Get answer
        result = rag_pipeline.run(query)
        answer = result["answer"]
        
        # Convert answer to speech
        audio_file = voice_service.generate_audio(answer, f"{temp_id}_output.mp3")
        
        return {
            "success": True,
            "status": "success",
            "query": query,
            "answer": answer,
            "audio_file": audio_file,
            "data": {
                "query": query,
                "answer": answer,
                "audio_file": audio_file,
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
def get_audio(filename: str):
    """Get generated audio file"""
    audio_path = os.path.join(TEMP_DIR, filename)
    if not os.path.exists(audio_path):
        audio_path = os.path.join("static", filename)
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio not found")
    
    return FileResponse(audio_path, media_type="audio/mpeg")


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