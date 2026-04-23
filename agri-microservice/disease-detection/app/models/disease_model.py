# import os
# import tensorflow as tf


# # Disease classes (38 total)
# DISEASE_CLASSES = [
#     'Apple___Apple_scab',
#     'Apple___Black_rot',
#     'Apple___Cedar_apple_rust',
#     'Apple___healthy',
#     'Blueberry___healthy',
#     'Cherry_(including_sour)___Powdery_mildew',
#     'Cherry_(including_sour)___healthy',
#     'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
#     'Corn_(maize)___Common_rust_',
#     'Corn_(maize)___Northern_Leaf_Blight',
#     'Corn_(maize)___healthy',
#     'Grape___Black_rot',
#     'Grape___Esca_(Black_Measles)',
#     'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
#     'Grape___healthy',
#     'Orange___Haunglongbing_(Citrus_greening)',
#     'Peach___Bacterial_spot',
#     'Peach___healthy',
#     'Pepper,_bell___Bacterial_spot',
#     'Pepper,_bell___healthy',
#     'Potato___Early_blight',
#     'Potato___Late_blight',
#     'Potato___healthy',
#     'Raspberry___healthy',
#     'Soybean___healthy',
#     'Squash___Powdery_mildew',
#     'Strawberry___Leaf_scorch',
#     'Strawberry___healthy',
#     'Tomato___Bacterial_spot',
#     'Tomato___Early_blight',
#     'Tomato___Late_blight',
#     'Tomato___Leaf_Mold',
#     'Tomato___Septoria_leaf_spot',
#     'Tomato___Spider_mites Two-spotted_spider_mite',
#     'Tomato___Target_Spot',
#     'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
#     'Tomato___Tomato_mosaic_virus',
#     'Tomato___healthy',
# ]


# def _build_efficientnet_b0_classifier(img_size: int, num_classes: int) -> tf.keras.Model:
#     """
#     Matches the training notebook:
#       EfficientNetB0 (imagenet, include_top=False) -> GAP -> Dense(256,relu) -> Dense(38,softmax)
#     """
#     base_model = tf.keras.applications.EfficientNetB0(
#         include_top=False,
#         weights="imagenet",
#         input_shape=(img_size, img_size, 3),
#     )
#     base_model.trainable = False

#     inputs = tf.keras.Input(shape=(img_size, img_size, 3))
#     x = tf.keras.applications.efficientnet.preprocess_input(inputs)
#     x = base_model(x, training=False)
#     x = tf.keras.layers.GlobalAveragePooling2D()(x)
#     x = tf.keras.layers.Dense(256, activation="relu")(x)
#     outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
#     return tf.keras.Model(inputs, outputs, name="agrovision_efficientnetb0")


# def resolve_model_path(service_dir: str) -> str:
#     """
#     Resolve which model file to load.
#     Priority:
#       1) MODEL_PATH env var
#       2) models/model.weights.h5 (weights-only, EfficientNetB0)
#       3) models/plant-disease-detection.h5 (full Keras model)
#       4) legacy Model.hdf5 in service root
#     """
#     env_path = os.getenv("MODEL_PATH")
#     if env_path:
#         return env_path

#     models_dir = os.path.join(service_dir, "models")
#     candidate_weights = os.path.join(models_dir, "model.weights.h5")
#     if os.path.exists(candidate_weights):
#         return candidate_weights

#     candidate_full = os.path.join(models_dir, "plant-disease-detection.h5")
#     if os.path.exists(candidate_full):
#         return candidate_full

#     legacy = os.path.join(service_dir, "Model.hdf5")
#     return legacy


# class DiseaseDetectionModel:
#     def __init__(self):
#         self.service_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
#         self.img_size = int(os.getenv("IMG_SIZE", "224"))
#         self.model_path = resolve_model_path(self.service_dir)
#         self.model_kind = None  # "weights_only" | "full_model"
#         self.model = None

#     def load(self) -> None:
#         if not os.path.exists(self.model_path):
#             raise FileNotFoundError(self.model_path)

#         if self.model_path.endswith(".weights.h5"):
#             self.model_kind = "weights_only"
#             self.model = _build_efficientnet_b0_classifier(self.img_size, len(DISEASE_CLASSES))
#             self.model.load_weights(self.model_path)
#         else:
#             self.model_kind = "full_model"
#             self.model = tf.keras.models.load_model(self.model_path)

#     def predict(self, image_array):
#         if self.model is None:
#             raise RuntimeError("Model not loaded")
#         return self.model.predict(image_array, verbose=0)



import os
import logging
import tensorflow as tf

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Disease classes (38 total)
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
    'Tomato___healthy',
]


def _build_efficientnet_b0_classifier(img_size: int, num_classes: int) -> tf.keras.Model:
    """
    Build the EfficientNetB0 architecture matching the training notebook.
    """
    logger.info(f"Building EfficientNetB0 model with img_size={img_size}, num_classes={num_classes}")
    
    base_model = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(img_size, img_size, 3),
    )
    base_model.trainable = False
    logger.info("Base EfficientNetB0 loaded with ImageNet weights")

    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    
    model = tf.keras.Model(inputs, outputs, name="agrovision_efficientnetb0")
    
    # Build the model by passing a dummy input (required before loading weights)
    dummy_input = tf.zeros((1, img_size, img_size, 3))
    model(dummy_input)
    logger.info("Model built successfully with dummy input")
    
    return model


def resolve_model_path(service_dir: str) -> str:
    """
    Resolve which model file to load.
    Priority:
      1) MODEL_PATH environment variable
      2) models/model.weights.h5 (weights-only, EfficientNetB0)
      3) models/plant-disease-detection.h5 (full Keras model)
    """
    env_path = os.getenv("MODEL_PATH")
    if env_path:
        logger.info(f"Using MODEL_PATH from env: {env_path}")
        return env_path

    models_dir = os.path.join(service_dir, "models")
    candidate_weights = os.path.join(models_dir, "model.weights.h5")
    
    if os.path.exists(candidate_weights):
        logger.info(f"Found weights file: {candidate_weights}")
        return candidate_weights

    candidate_full = os.path.join(models_dir, "plant-disease-detection.h5")
    if os.path.exists(candidate_full):
        logger.info(f"Found full model file: {candidate_full}")
        return candidate_full

    logger.warning(f"No model found in {models_dir}, using default path: {candidate_weights}")
    return candidate_weights


class DiseaseDetectionModel:
    """
    Wrapper class for the disease detection model.
    Handles loading the model and making predictions.
    """
    
    def __init__(self):
        # Get the service root directory (parent of 'app' folder)
        # Current file: disease/app/models/disease_model.py
        # Go up 2 levels to get disease/ root
        self.service_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.img_size = int(os.getenv("IMG_SIZE", "224"))
        self.num_classes = len(DISEASE_CLASSES)
        self.model_path = resolve_model_path(self.service_dir)
        self.model_kind = None  # "weights_only" | "full_model"
        self.model = None
        
        logger.info("=" * 60)
        logger.info("DiseaseDetectionModel Initialized")
        logger.info(f"  Service directory: {self.service_dir}")
        logger.info(f"  Image size: {self.img_size}")
        logger.info(f"  Number of classes: {self.num_classes}")
        logger.info(f"  Model path: {self.model_path}")
        logger.info("=" * 60)

    def load(self) -> None:
        """Load the model and weights from disk."""
        logger.info("Loading disease detection model...")
        
        # Check if model file exists
        if not os.path.exists(self.model_path):
            error_msg = f"Model file not found at: {self.model_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
        
        file_size = os.path.getsize(self.model_path) / (1024 * 1024)  # Size in MB
        logger.info(f"Model file found: {self.model_path} ({file_size:.2f} MB)")
        
        try:
            # Load based on file extension
            if self.model_path.endswith(".weights.h5"):
                self.model_kind = "weights_only"
                logger.info("Loading as weights-only model (EfficientNetB0 architecture)...")
                
                # Build the model architecture
                self.model = _build_efficientnet_b0_classifier(self.img_size, self.num_classes)
                
                # Load the weights
                self.model.load_weights(self.model_path)
                logger.info("✅ Weights loaded successfully into EfficientNetB0 model")
                
            else:
                self.model_kind = "full_model"
                logger.info("Loading as full Keras model...")
                
                # Load the complete model
                self.model = tf.keras.models.load_model(self.model_path)
                logger.info("✅ Full model loaded successfully")
            
            # Log model summary
            logger.info("Model Summary:")
            self.model.summary(print_fn=logger.info)
            
            # Log total parameters
            total_params = self.model.count_params()
            trainable_params = sum([tf.keras.backend.count_params(w) for w in self.model.trainable_weights])
            logger.info(f"Total parameters: {total_params:,}")
            logger.info(f"Trainable parameters: {trainable_params:,}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise

    def predict(self, image_array: tf.Tensor) -> tf.Tensor:
        """
        Run inference on the preprocessed image.
        
        Args:
            image_array: Preprocessed image tensor of shape (1, img_size, img_size, 3)
            
        Returns:
            Model predictions
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() first.")
        
        return self.model.predict(image_array, verbose=0)

    def is_loaded(self) -> bool:
        """Check if model is successfully loaded."""
        return self.model is not None
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model."""
        return {
            "model_kind": self.model_kind,
            "model_path": self.model_path,
            "img_size": self.img_size,
            "num_classes": self.num_classes,
            "is_loaded": self.is_loaded(),
            "service_dir": self.service_dir
        }


# For testing the model loading directly
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Testing Disease Detection Model Loading")
    print("=" * 60 + "\n")
    
    try:
        model_wrapper = DiseaseDetectionModel()
        model_wrapper.load()
        
        print("\n" + "=" * 60)
        print("✅ Model loaded successfully!")
        print(f"Model Info: {model_wrapper.get_model_info()}")
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Failed to load model: {e}\n")