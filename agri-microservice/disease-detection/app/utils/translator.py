import os
import google.generativeai as genai
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    gemini_model = None
    print("⚠️ GEMINI_API_KEY not set. Translation will use fallback.")

# Cache for translations
_translation_cache = {}

def translate_disease_sync(disease_key: str, target_language: str) -> str:
    """Synchronous translation using Gemini"""
    if not disease_key:
        return "Unknown"
    
    # Check cache
    cache_key = f"{disease_key}_{target_language}"
    if cache_key in _translation_cache:
        return _translation_cache[cache_key]
    
    # Parse disease key (format: "Crop___DiseaseName")
    parts = disease_key.split('___')
    crop = parts[0] if parts else ""
    disease_name = parts[1].replace('_', ' ') if len(parts) > 1 else disease_key
    
    # Language mapping
    lang_map = {
        'en': 'English',
        'hi': 'Hindi', 
        'pa': 'Punjabi'
    }
    target_lang = lang_map.get(target_language, 'English')
    
    # For English, just format nicely
    if target_language == 'en':
        result = disease_name.title()
        _translation_cache[cache_key] = result
        return result
    
    # If Gemini is not available, use fallback
    if not gemini_model:
        return _fallback_translation(disease_name, target_language)
    
    prompt = f"""Translate this plant disease name to {target_lang}. Return ONLY the translation, nothing else.

Disease: {disease_name}

Examples:
- "Apple Scab" in Hindi: "सेब की पपड़ी"
- "Early Blight" in Hindi: "प्रारंभिक झुलसा"
- "Late Blight" in Punjabi: "ਅੰਤਮ ਝੁਲਸ"
- "healthy" in Hindi: "स्वस्थ"

Translate: {disease_name}"""
    
    try:
        response = gemini_model.generate_content(prompt)
        translated = response.text.strip()
        _translation_cache[cache_key] = translated
        return translated
    except Exception as e:
        print(f"Gemini translation error: {e}")
        return _fallback_translation(disease_name, target_language)


async def translate_disease(disease_key: str, target_language: str) -> str:
    """Async wrapper for translation"""
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        result = await loop.run_in_executor(
            executor, 
            translate_disease_sync, 
            disease_key, 
            target_language
        )
    return result


def _fallback_translation(disease_name: str, target_language: str) -> str:
    """Fallback translations when Gemini is unavailable"""
    fallbacks = {
        'hi': {
            'Apple Scab': 'सेब की पपड़ी',
            'Apple Black Rot': 'सेब का काला सड़न',
            'Cedar Apple Rust': 'सेब का जंग रोग',
            'healthy': 'स्वस्थ',
            'Early Blight': 'प्रारंभिक झुलसा',
            'Late Blight': 'अंतिम झुलसा',
            'Bacterial spot': 'जीवाणु धब्बा',
            'Powdery mildew': 'चूर्णिल आसिता',
            'Leaf Mold': 'पत्ती फफूंद',
            'Target Spot': 'लक्ष्य धब्बा',
            'Mosaic Virus': 'मोज़ेक वायरस',
            'Yellow Leaf Curl Virus': 'पीला पत्ती कर्ल वायरस',
            'Septoria leaf spot': 'सेप्टोरिया पत्ती धब्बा',
            'Spider mites': 'मकड़ी घुन',
            'Gray leaf spot': 'स्लेटी पत्ता धब्बा',
            'Common rust': 'सामान्य जंग',
            'Northern Leaf Blight': 'उत्तरी पत्ती झुलसा',
            'Black rot': 'काला सड़न',
            'Esca': 'एस्का रोग',
            'Leaf blight': 'पत्ती झुलसा',
            'Haunglongbing': 'हरापन रोग',
            'Citrus greening': 'सिट्रस ग्रीनिंग',
            'Leaf scorch': 'पत्ती जलन'
        },
        'pa': {
            'Apple Scab': 'ਸੇਬ ਦੀ ਖੁਰਕ',
            'Apple Black Rot': 'ਸੇਬ ਦਾ ਕਾਲਾ ਸੜਨ',
            'Cedar Apple Rust': 'ਸੇਬ ਦਾ ਜੰਗ ਰੋਗ',
            'healthy': 'ਤੰਦਰੁਸਤ',
            'Early Blight': 'ਸ਼ੁਰੂਆਤੀ ਝੁਲਸ',
            'Late Blight': 'ਅੰਤਮ ਝੁਲਸ',
            'Bacterial spot': 'ਬੈਕਟੀਰੀਆ ਧੱਬਾ',
            'Powdery mildew': 'ਪਾਊਡਰੀ ਫ਼ਫੂੰਦੀ',
            'Leaf Mold': 'ਪੱਤਾ ਫ਼ਫੂੰਦੀ',
            'Target Spot': 'ਟਾਰਗੇਟ ਧੱਬਾ',
            'Mosaic Virus': 'ਮੋਜ਼ੇਕ ਵਾਇਰਸ',
            'Yellow Leaf Curl Virus': 'ਪੀਲਾ ਪੱਤਾ ਕਰਲ ਵਾਇਰਸ',
            'Septoria leaf spot': 'ਸੈਪਟੋਰੀਆ ਪੱਤਾ ਧੱਬਾ',
            'Spider mites': 'ਮੱਕੜੀ ਘੁਣ',
            'Gray leaf spot': 'ਸਲੇਟੀ ਪੱਤਾ ਧੱਬਾ',
            'Common rust': 'ਆਮ ਜੰਗ',
            'Northern Leaf Blight': 'ਉੱਤਰੀ ਪੱਤਾ ਝੁਲਸ',
            'Black rot': 'ਕਾਲਾ ਸੜਨ',
            'Esca': 'ਏਸਕਾ ਰੋਗ',
            'Leaf blight': 'ਪੱਤਾ ਝੁਲਸ',
            'Haunglongbing': 'ਹਰਾਪਣ ਰੋਗ',
            'Citrus greening': 'ਸਿਟਰਸ ਗ੍ਰੀਨਿੰਗ',
            'Leaf scorch': 'ਪੱਤਾ ਜਲਨ'
        }
    }
    
    # Try exact match
    if target_language in fallbacks:
        if disease_name in fallbacks[target_language]:
            return fallbacks[target_language][disease_name]
    
    # Try partial match
    for key, value in fallbacks.get(target_language, {}).items():
        if key.lower() in disease_name.lower() or disease_name.lower() in key.lower():
            return value
    
    # Return original with underscores removed
    return disease_name.replace('_', ' ').title()