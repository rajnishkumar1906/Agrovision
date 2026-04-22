from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from PIL import Image
import io
import tensorflow as tf
import os
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for startup and shutdown events.
    Replaces the deprecated @app.on_event("startup").
    """
    # Load the model when the app starts
    _load_model_on_startup()
    yield
    # Clean up on shutdown
    global MODEL
    MODEL = None

# Initialize FastAPI app
app = FastAPI(
    title="Crop Disease Detection Service",
    version="1.0.0",
    description="Image-based crop disease detection microservice",
    lifespan=lifespan
)

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Disease classes - 38 classes from the AlexNet model
DISEASE_CLASSES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Response model (frontend-friendly; always returns the same shape)
class DiseaseDetectionResponse(BaseModel):
    predicted_crop: Optional[str] = None
    disease: Optional[str] = None
    confidence: float = 0.0
    class_index: int = -1
    error: Optional[str] = None

# Global model variable
MODEL = None
MODEL_FILE_PATH = None
MODEL_KIND = None  # "full_model" | "weights_only"

IMG_SIZE = int(os.getenv("IMG_SIZE", "224"))
NUM_CLASSES = 38

def build_efficientnet_b0_classifier(img_size: int = 224, num_classes: int = 38) -> tf.keras.Model:
    """
    Build the same architecture used in the training notebook:
      EfficientNetB0 (imagenet, include_top=False) -> GAP -> Dense(256, relu) -> Dense(38, softmax)
    """
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(img_size, img_size, 3),
    )
    base_model.trainable = False  # inference

    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs, name="agrovision_efficientnetb0")
    return model

def resolve_model_path() -> str:
    """
    Resolve the model path from env or default location.

    You can override with:
      - MODEL_PATH="F:\\path\\to\\your_model.h5"
    """
    env_path = os.getenv("MODEL_PATH")
    if env_path:
        return env_path

    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")

    # Prefer the weights file if it exists (your current setup)
    candidate_weights = os.path.join(models_dir, "model.weights.h5")
    if os.path.exists(candidate_weights):
        return candidate_weights

    # Otherwise, fall back to a full exported model name
    return os.path.join(models_dir, "plant-disease-detection.h5")

def _load_model_on_startup():
    """Internal helper to load the model and weights on startup"""
    global MODEL, MODEL_FILE_PATH, MODEL_KIND
    try:
        MODEL_FILE_PATH = resolve_model_path()

        # Backward compatibility: old filename in repo
        if not os.path.exists(MODEL_FILE_PATH):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            legacy_path = os.path.join(base_dir, "Model.hdf5")
            if os.path.exists(legacy_path):
                MODEL_FILE_PATH = legacy_path

        if not os.path.exists(MODEL_FILE_PATH):
            print(f"✗ Model file not found: {MODEL_FILE_PATH}. Check your environment or models/ folder.")
            MODEL = None
            return

        if MODEL_FILE_PATH.endswith(".weights.h5"):
            MODEL_KIND = "weights_only"
            MODEL = build_efficientnet_b0_classifier(img_size=IMG_SIZE, num_classes=NUM_CLASSES)
            MODEL.load_weights(MODEL_FILE_PATH)
        else:
            MODEL_KIND = "full_model"
            MODEL = tf.keras.models.load_model(MODEL_FILE_PATH)
        
        print(f"✓ {MODEL_KIND.replace('_', ' ').capitalize()} loaded successfully: {MODEL_FILE_PATH}")
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        MODEL = None

async def preprocess_image(img_file: UploadFile) -> np.ndarray:
    """
    Preprocess the uploaded image for model prediction.
    - Resize to IMG_SIZE x IMG_SIZE
    - Convert to numpy array
    - Return float32 array (model preprocessing is handled in-model for EfficientNet)
    """
    try:
        img_bytes = await img_file.read()
        if not img_bytes:
            return None
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # Resize
        img = img.resize((IMG_SIZE, IMG_SIZE))
        
        # Convert to numpy array
        x = np.array(img, dtype=np.float32)

        # Add batch dimension
        x = np.expand_dims(x, axis=0)
        
        return x
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "message": "Crop Disease Detection Service is running",
        "model_loaded": MODEL is not None,
        "model_path": MODEL_FILE_PATH,
        "model_kind": MODEL_KIND,
        "img_size": IMG_SIZE,
        "total_classes": len(DISEASE_CLASSES)
    }

@app.post("/predict", response_model=DiseaseDetectionResponse, tags=["Prediction"])
async def predict(file: UploadFile = File(...)):
    """
    Predict crop disease from a leaf image.
    
    Parameters:
    - file: Image file (JPG, PNG) of a plant leaf
    
    Returns:
    - JSON with predicted_crop, disease, confidence, and class_index
    """
    
    if MODEL is None:
        return DiseaseDetectionResponse(error="Model not loaded")
    
    try:
        if not file:
            raise HTTPException(status_code=400, detail="Missing file field")

        # Preprocess the image
        processed_image = await preprocess_image(file)
        
        if processed_image is None:
            return DiseaseDetectionResponse(error="Failed to process image")
        
        # Make prediction
        predictions = MODEL.predict(processed_image, verbose=0)
        
        # Get the prediction array
        pred_array = predictions[0].flatten()
        
        # Find the class with highest confidence
        class_index = int(np.argmax(pred_array))
        confidence = float(pred_array[class_index])
        
        # Get class name
        if class_index < len(DISEASE_CLASSES):
            class_name = DISEASE_CLASSES[class_index]
            
            # Split class name by '___' to get crop and disease
            parts = class_name.split('___')
            predicted_crop = parts[0]
            disease = parts[1].title().replace('_', ' ')
        else:
            predicted_crop = "Unknown"
            disease = "Unknown"
        
        return DiseaseDetectionResponse(
            predicted_crop=predicted_crop,
            disease=disease,
            confidence=confidence,
            class_index=class_index,
            error=None,
        )
    
    except Exception as e:
        print(f"Error during prediction: {e}")
        return DiseaseDetectionResponse(error=str(e))

@app.get("/classes", tags=["Info"])
async def get_classes():
    """Get the list of all supported disease classes"""
    return {
        "total_classes": len(DISEASE_CLASSES),
        "classes": DISEASE_CLASSES
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
