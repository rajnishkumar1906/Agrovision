from transformers import pipeline
import logging
import os

# Suppress tokenizer parallelism warning
os.environ["TOKENIZERS_PARALLELISM"] = "false"

class SpeechToText:

    def __init__(self, model_name="openai/whisper-base", language=None):
        """
        Initialize speech to text model
        Args:
            model_name: Whisper model size (tiny, base, small, medium, large)
            language: Language code (e.g., "hi" for Hindi, "ta" for Tamil)
        """
        self.model_name = model_name
        self.language = language
        try:
            logging.info(f"Loading speech to text model: {model_name}...")
            self.pipe = pipeline(
                "automatic-speech-recognition",
                model=model_name,
                chunk_length_s=30,
                device="cpu", # Explicitly set device to avoid overhead, change to 0 for GPU
                model_kwargs={"low_cpu_mem_usage": True}
            )
            # Warm up the model with a tiny silence or empty call if possible
            logging.info(f"Speech to text model {model_name} loaded successfully")
        except Exception as e:
            logging.error(f"Failed to load speech model: {e}")
            raise

    def transcribe(self, file_path):
        """Transcribe audio file to text"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        try:
            # Set generation parameters
            generate_kwargs = {
                "task": "transcribe",
                "language": self.language if self.language else "en"
            }
            
            result = self.pipe(
                file_path, 
                generate_kwargs=generate_kwargs,
                return_timestamps=False
            )
            
            text = result["text"]
            logging.info(f"Transcribed: {text[:50]}...")
            return text.strip()
            
        except RuntimeError as e:
            if "ffmpeg" in str(e).lower():
                logging.error("FFmpeg is not installed on the server. Voice features require FFmpeg.")
                return "ERROR_FFMPEG_MISSING"
            logging.error(f"Transcription runtime error: {e}")
            return ""
        except Exception as e:
            logging.error(f"Transcription failed: {e}")
            return ""

    def transcribe_batch(self, file_paths):
        """Transcribe multiple audio files"""
        results = []
        for file_path in file_paths:
            text = self.transcribe(file_path)
            results.append({"file": file_path, "text": text})
        return results