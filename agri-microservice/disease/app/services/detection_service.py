import io
import numpy as np
from PIL import Image
from app.models.disease_model import DiseaseDetectionModel, DISEASE_CLASSES
from app.utils.translator import translate_disease_sync  # Add this import

class DiseaseDetectionService:
    def __init__(self):
        self.model_wrapper = DiseaseDetectionModel()
        self.model_wrapper.load()

    @property
    def model_path(self) -> str:
        return self.model_wrapper.model_path

    @property
    def model_kind(self) -> str:
        return self.model_wrapper.model_kind

    @property
    def img_size(self) -> int:
        return self.model_wrapper.img_size

    async def process_image(self, upload_file) -> np.ndarray:
        img_bytes = await upload_file.read()
        if not img_bytes:
            return None

        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img = img.resize((self.img_size, self.img_size))

        x = np.array(img, dtype=np.float32)
        x = np.expand_dims(x, axis=0)
        return x

    async def detect(self, upload_file, language: str = "en"):
    """
    Detect disease from uploaded image.
    language: 'en', 'hi', or 'pa' for translation
    """
    print(f"🔍 Detection called with language: {language}")  # Debug
    
    processed = await self.process_image(upload_file)
    if processed is None:
        return {
            "error": "Failed to process image",
            "predicted_crop": None,
            "disease": None,
            "disease_translated": None,
            "confidence": 0.0,
            "class_index": -1,
        }

    predictions = self.model_wrapper.predict(processed)
    pred_array = predictions[0].flatten()

    class_index = int(np.argmax(pred_array))
    confidence = float(pred_array[class_index])

    if class_index < len(DISEASE_CLASSES):
        disease_key = DISEASE_CLASSES[class_index]
        parts = disease_key.split("___")
        predicted_crop = parts[0]
        disease_name = parts[1].title().replace("_", " ")
        
        print(f"🔍 Disease detected: {disease_key}")
        print(f"🔍 Translating to: {language}")
        
        # Translate disease name using Gemini
        try:
            translated_disease = translate_disease_sync(disease_key, language)
            print(f"✅ Translation successful: {translated_disease}")
        except Exception as e:
            print(f"❌ Translation failed: {e}")
            translated_disease = disease_name
        
    else:
        predicted_crop = "Unknown"
        disease_name = "Unknown"
        translated_disease = "Unknown"
        disease_key = "Unknown"

    return {
        "predicted_crop": predicted_crop,
        "disease": disease_name,
        "disease_translated": translated_disease,
        "disease_key": disease_key,
        "confidence": confidence,
        "class_index": class_index,
        "error": None,
    }