import os
from dotenv import load_dotenv

# Try different .env file locations
load_dotenv("krishibot.env")
load_dotenv(".env")
load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
    MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.0-flash-lite")