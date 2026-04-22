from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.models.schemas import DiseaseDetectionResponse
from app.services.detection_service import DiseaseDetectionService
from app.models.disease_model import DISEASE_CLASSES

router = APIRouter()

try:
    detection_service = DiseaseDetectionService()
except Exception as e:
    detection_service = None
    startup_error = str(e)


@router.get("/", tags=["Health"])
async def health_check():
    if detection_service is None:
        return {
            "message": "Disease Detection Service failed to start",
            "status": "error",
            "error": startup_error,
        }
    return {
        "message": "Disease Detection Service is running",
        "status": "ok",
        "model_loaded": True,
        "model_kind": detection_service.model_kind,
        "model_path": detection_service.model_path,
        "img_size": detection_service.img_size,
        "total_classes": len(DISEASE_CLASSES),
    }


@router.get("/classes", tags=["Info"])
async def get_classes():
    return {"total_classes": len(DISEASE_CLASSES), "classes": DISEASE_CLASSES}


@router.post("/predict", response_model=DiseaseDetectionResponse, tags=["Prediction"])
async def predict_disease(
    file: UploadFile = File(...),
    language: str = Query("en", description="Language for translation: en, hi, pa")
):
    """
    Predict crop disease from a leaf image.
    
    Parameters:
    - file: Image file (JPG, PNG) of a plant leaf
    - language: Language code for disease name translation (en, hi, pa)
    
    Returns:
    - JSON with predicted_crop, disease, confidence, and class_index
    """
    if detection_service is None:
        raise HTTPException(status_code=500, detail=startup_error)
    try:
        result = await detection_service.detect(file, language)
        return DiseaseDetectionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))