import logging

# Configure logging
logger = logging.getLogger(__name__)

# Comprehensive translation dictionary for all 38 disease classes
# Format: { 'disease_key': { 'hi': 'Hindi Translation', 'pa': 'Punjabi Translation' } }
DISEASE_TRANSLATIONS = {
    'Apple___Apple_scab': {
        'hi': 'सेब की पपड़ी',
        'pa': 'ਸੇਬ ਦੀ ਖੁਰਕ'
    },
    'Apple___Black_rot': {
        'hi': 'सेब का काला सड़न',
        'pa': 'ਸੇਬ ਦਾ ਕਾਲਾ ਸੜਨ'
    },
    'Apple___Cedar_apple_rust': {
        'hi': 'सेब का जंग रोग',
        'pa': 'ਸੇਬ ਦਾ ਜੰਗ ਰੋਗ'
    },
    'Apple___healthy': {
        'hi': 'सेब - स्वस्थ',
        'pa': 'ਸੇਬ - ਤੰਦਰੁਸਤ'
    },
    'Blueberry___healthy': {
        'hi': 'ब्लूबेरी - स्वस्थ',
        'pa': 'ਬਲੂਬੇਰੀ - ਤੰਦਰੁਸਤ'
    },
    'Cherry_(including_sour)___Powdery_mildew': {
        'hi': 'चेरी - चूर्णिल आसिता',
        'pa': 'ਚੈਰੀ - ਪਾਊਡਰੀ ਫ਼ਫੂੰਦੀ'
    },
    'Cherry_(including_sour)___healthy': {
        'hi': 'चेरी - स्वस्थ',
        'pa': 'ਚੈਰੀ - ਤੰਦਰੁਸਤ'
    },
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
        'hi': 'मक्का - स्लेटी पत्ता धब्बा',
        'pa': 'ਮੱਕੀ - ਸਲੇਟੀ ਪੱਤਾ ਧੱਬਾ'
    },
    'Corn_(maize)___Common_rust_': {
        'hi': 'मक्का - सामान्य जंग',
        'pa': 'ਮੱਕੀ - ਆਮ ਜੰਗ'
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
        'hi': 'मक्का - उत्तरी पत्ती झुलसा',
        'pa': 'ਮੱਕੀ - ਉੱਤਰੀ ਪੱਤਾ ਝੁਲਸ'
    },
    'Corn_(maize)___healthy': {
        'hi': 'मक्का - स्वस्थ',
        'pa': 'ਮੱਕੀ - ਤੰਦਰੁਸਤ'
    },
    'Grape___Black_rot': {
        'hi': 'अंगूर - काला सड़न',
        'pa': 'ਅੰਗੂਰ - ਕਾਲਾ ਸੜਨ'
    },
    'Grape___Esca_(Black_Measles)': {
        'hi': 'अंगूर - एस्का रोग (काला खसरा)',
        'pa': 'ਅੰਗੂਰ - ਏਸਕਾ ਰੋਗ (ਕਾਲਾ ਖਸਰਾ)'
    },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        'hi': 'अंगूर - पत्ती झुलसा',
        'pa': 'ਅੰਗੂਰ - ਪੱਤਾ ਝੁਲਸ'
    },
    'Grape___healthy': {
        'hi': 'अंगूर - स्वस्थ',
        'pa': 'ਅੰਗੂਰ - ਤੰਦਰੁਸਤ'
    },
    'Orange___Haunglongbing_(Citrus_greening)': {
        'hi': 'संतरा - सिट्रस ग्रीनिंग (हरापन रोग)',
        'pa': 'ਸੰਤਰਾ - ਸਿਟਰਸ ਗ੍ਰੀਨਿੰਗ (ਹਰਾਪਣ ਰੋਗ)'
    },
    'Peach___Bacterial_spot': {
        'hi': 'आड़ू - जीवाणु धब्बा',
        'pa': 'ਆੜੂ - ਬੈਕਟੀਰੀਆ ਧੱਬਾ'
    },
    'Peach___healthy': {
        'hi': 'आड़ू - स्वस्थ',
        'pa': 'ਆੜੂ - ਤੰਦਰੁਸਤ'
    },
    'Pepper,_bell___Bacterial_spot': {
        'hi': 'शिमला मिर्च - जीवाणु धब्बा',
        'pa': 'ਸ਼ਿਮਲਾ ਮਿਰਚ - ਬੈਕਟੀਰੀਆ ਧੱਬਾ'
    },
    'Pepper,_bell___healthy': {
        'hi': 'शिमला मिर्च - स्वस्थ',
        'pa': 'ਸ਼ਿਮਲਾ ਮਿਰਚ - ਤੰਦਰੁਸਤ'
    },
    'Potato___Early_blight': {
        'hi': 'आलू - प्रारंभिक झुलसा',
        'pa': 'ਆਲੂ - ਸ਼ੁਰੂਆਤੀ ਝੁਲਸ'
    },
    'Potato___Late_blight': {
        'hi': 'आलू - अंतिम झुलसा',
        'pa': 'ਆਲੂ - ਅੰਤਮ ਝੁਲਸ'
    },
    'Potato___healthy': {
        'hi': 'आलू - स्वस्थ',
        'pa': 'ਆਲੂ - ਤੰਦਰੁਸਤ'
    },
    'Raspberry___healthy': {
        'hi': 'रसभरी - स्वस्थ',
        'pa': 'ਰਸਬੇਰੀ - ਤੰਦਰੁਸਤ'
    },
    'Soybean___healthy': {
        'hi': 'सोयाबीन - स्वस्थ',
        'pa': 'ਸੋਇਆਬੀਨ - ਤੰਦਰੁਸਤ'
    },
    'Squash___Powdery_mildew': {
        'hi': 'कद्दू - चूर्णिल आसिता',
        'pa': 'ਕੱਦੂ - ਪਾਊਡਰੀ ਫ਼ਫੂੰਦੀ'
    },
    'Strawberry___Leaf_scorch': {
        'hi': 'स्ट्रॉबेरी - पत्ती जलन',
        'pa': 'ਸਟ੍ਰਾਬੇਰੀ - ਪੱਤਾ ਜਲਨ'
    },
    'Strawberry___healthy': {
        'hi': 'स्ट्रॉबेरी - स्वस्थ',
        'pa': 'ਸਟ੍ਰਾਬੇਰੀ - ਤੰਦਰੁਸਤ'
    },
    'Tomato___Bacterial_spot': {
        'hi': 'टमाटर - जीवाणु धब्बा',
        'pa': 'ਟਮਾਟਰ - ਬੈਕਟੀਰੀਆ ਧੱਬਾ'
    },
    'Tomato___Early_blight': {
        'hi': 'टमाटर - प्रारंभिक झुलसा',
        'pa': 'ਟਮਾਟਰ - ਸ਼ੁਰੂਆਤੀ ਝੁਲਸ'
    },
    'Tomato___Late_blight': {
        'hi': 'टमाटर - अंतिम झुलसा',
        'pa': 'ਟਮਾਟਰ - ਅੰਤਮ ਝੁਲਸ'
    },
    'Tomato___Leaf_Mold': {
        'hi': 'टमाटर - पत्ती फफूंद',
        'pa': 'ਟਮਾਟਰ - ਪੱਤਾ ਫ਼ਫੂੰਦੀ'
    },
    'Tomato___Septoria_leaf_spot': {
        'hi': 'टमाटर - सेप्टोरिया पत्ती धब्बा',
        'pa': 'ਟਮਾਟਰ - ਸੈਪਟੋਰੀਆ ਪੱਤਾ ਧੱਬਾ'
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
        'hi': 'टमाटर - मकड़ी घुन',
        'pa': 'ਟਮਾਟਰ - ਮੱਕੜੀ ਘੁਣ'
    },
    'Tomato___Target_Spot': {
        'hi': 'टमाटर - लक्ष्य धब्बा',
        'pa': 'ਟਮਾਟਰ - ਟਾਰਗੇਟ ਧੱਬਾ'
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        'hi': 'टमाटर - पीला पत्ती कर्ल वायरस',
        'pa': 'ਟਮਾਟਰ - ਪੀਲਾ ਪੱਤਾ ਕਰਲ ਵਾਇਰਸ'
    },
    'Tomato___Tomato_mosaic_virus': {
        'hi': 'टमाटर - मोज़ेक वायरस',
        'pa': 'ਟਮਾਟਰ - ਮੋਜ਼ੇਕ ਵਾਇਰਸ'
    },
    'Tomato___healthy': {
        'hi': 'टमाटर - स्वस्थ',
        'pa': 'ਟਮਾਟਰ - ਤੰਦਰੁਸਤ'
    }
}

def translate_disease_sync(disease_key: str, target_language: str) -> str:
    """Dictionary-based translation for disease names"""
    if not disease_key:
        return "Unknown"
    
    # For English, format nicely from the key
    if target_language == 'en':
        parts = disease_key.split('___')
        disease_name = parts[1].replace('_', ' ') if len(parts) > 1 else disease_key
        return disease_name.title()
    
    # Check if we have a direct translation in our dictionary
    if disease_key in DISEASE_TRANSLATIONS:
        lang_translations = DISEASE_TRANSLATIONS[disease_key]
        if target_language in lang_translations:
            return lang_translations[target_language]
    
    # Fallback: remove underscores and title case
    parts = disease_key.split('___')
    disease_name = parts[1].replace('_', ' ') if len(parts) > 1 else disease_key
    return disease_name.title()

async def translate_disease(disease_key: str, target_language: str) -> str:
    """Async wrapper for compatibility"""
    return translate_disease_sync(disease_key, target_language)
