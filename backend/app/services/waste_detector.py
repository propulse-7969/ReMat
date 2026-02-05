import numpy as np
import os
from pathlib import Path
from PIL import Image
from keras.models import load_model
from keras.applications.resnet import preprocess_input

# Resolve model path relative to backend root (parent of app/)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
_DEFAULT_MODEL_PATH = _BACKEND_ROOT / "Models" / "ewaste_final.keras"


class WasteDetector:
    def __init__(self, model_path=None):
        """
        Initialize the waste detector with the trained model.
        
        Args:
            model_path (str|Path): Path to the saved Keras model file. Defaults to backend/Models/ewaste_final.keras
        """
        self.model_path = str(model_path or _DEFAULT_MODEL_PATH)
        self.model = None
        self.class_names = [
            "Battery",
            "Keyboard",
            "Microwave",
            "Mobile",
            "Mouse",
            "PCB",
            "Player",
            "Printer",
            "Television",
            "Washing Machine",
            "Laptop"
        ]
        self.load_model()
    
    def load_model(self):
        """Load the Keras model from disk."""
        try:
            self.model = load_model(self.model_path)
            print(f"Model loaded successfully from {self.model_path}")
        except Exception as e:
            raise Exception(f"Failed to load model: {str(e)}")
    
    def predict(self, image_path):
        """
        Predict the waste type from an image.
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            dict: Dictionary containing waste_type, confidence, and all probabilities
        """
        if self.model is None:
            raise Exception("Model not loaded. Call load_model() first.")
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")
        
        try:
            # Load and preprocess the image (using PIL - keras.preprocessing is deprecated)
            img = Image.open(image_path).convert("RGB")
            img = img.resize((224, 224))
            x = np.array(img, dtype=np.float32)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            
            # Make prediction
            pred = self.model.predict(x, verbose=0)
            class_idx = np.argmax(pred)
            confidence = float(pred[0][class_idx])
            waste_type = self.class_names[class_idx]
            
            # Get all class probabilities
            all_probabilities = {
                self.class_names[i]: float(pred[0][i]) 
                for i in range(len(self.class_names))
            }
            
            return {
                "waste_type": waste_type,
                "confidence": round(confidence, 4),
                "class_index": int(class_idx),
                "all_probabilities": all_probabilities
            }
            
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")
    
    def get_estimated_value(self, waste_type):
        """
        Get estimated value for a waste type.
        
        Args:
            waste_type (str): The type of waste
            
        Returns:
            int: Estimated value in currency units
        """
        value_mapping = {
            "Battery": 50,
            "Keyboard": 100,
            "Microwave": 500,
            "Mobile": 300,
            "Mouse": 75,
            "PCB": 200,
            "Player": 150,
            "Printer": 400,
            "Television": 800,
            "Washing Machine": 1200,
            "Laptop": 600,
        }
        return value_mapping.get(waste_type, 0)


# Create a singleton instance
_detector_instance = None

def get_waste_detector(model_path=None):
    """
    Get or create a WasteDetector instance (singleton pattern).
    
    Args:
        model_path (str): Path to the model file
        
    Returns:
        WasteDetector: The detector instance
    """
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = WasteDetector(model_path)
    return _detector_instance


# Convenience function for quick predictions
def predict_waste(image_path, model_path=None):
    """
    Convenience function to predict waste type from an image.
    
    Args:
        image_path (str): Path to the image file
        model_path (str): Path to the model file
        
    Returns:
        dict: Prediction results including waste_type, confidence, and estimated_value
    """
    detector = get_waste_detector(model_path)
    result = detector.predict(image_path)
    result["estimated_value"] = detector.get_estimated_value(result["waste_type"])
    return result