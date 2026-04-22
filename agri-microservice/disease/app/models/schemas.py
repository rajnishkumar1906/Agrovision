from pydantic import BaseModel
from typing import Optional


class DiseaseDetectionResponse(BaseModel):
    predicted_crop: Optional[str] = None
    disease: Optional[str] = None
    disease_translated: Optional[str] = None  # New field
    disease_key: Optional[str] = None         # New field
    confidence: float = 0.0
    class_index: int = -1
    error: Optional[str] = None