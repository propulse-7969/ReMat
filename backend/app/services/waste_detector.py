import numpy as np
import os
from pathlib import Path
from PIL import Image
from keras.models import load_model
from keras.applications.resnet import preprocess_input

# Resolve model path relative to backend root (parent of app/)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
_DEFAULT_MODEL_PATH = _BACKEND_ROOT / "Models" / "ewaste_final.keras"

# Scoring: confidence thresholds
HIGH_CONFIDENCE = 0.75
LOW_CONFIDENCE = 0.40

# Base points per waste type (used for Cases 1 & 2)
BASE_POINTS = {
    "Battery": 110,
    "Keyboard": 36,
    "Microwave": 270,
    "Mobile": 150,
    "Mouse": 27,
    "PCB": 165,
    "Player": 90,
    "Printer": 200,
    "Television": 330,
    "Washing Machine": 400,
    "Laptop": 180,
}

# Manual override caps (Case 3: confidence < 0.40 or user overrides ML)
MANUAL_OVERRIDE_POINTS = {
    "PCB": 90,
    "Battery": 60,
    "Mobile": 80,
    "Player": 50,
    "Mouse": 15,
    "Keyboard": 20,
    "Printer": 120,
    "Microwave": 150,
    "Television": 180,
    "Washing Machine": 220,
    "Laptop": 100,
}


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
    
    def get_base_points(self, waste_type):
        """Get base points for a waste type (for Cases 1 & 2)."""
        return BASE_POINTS.get(waste_type, 0)

    def get_manual_override_points(self, waste_type):
        """Get manual override cap for a waste type (Case 3)."""
        return MANUAL_OVERRIDE_POINTS.get(waste_type, 50)


def calculate_points(waste_type: str, confidence: float, user_override: bool = False) -> int:
    """
    Calculate points using confidence-based scoring logic.
    
    Case 1 (High Confidence): confidence >= 0.75 → points = base_points × confidence
    Case 2 (Low Confidence): 0.40 <= confidence < 0.75 → points = base_points × 0.6
    Case 3 (Manual): confidence < 0.40 or user_override → points = manual_override_cap
    """
    base = BASE_POINTS.get(waste_type, 0)
    manual = MANUAL_OVERRIDE_POINTS.get(waste_type, 50)
    
    if user_override or confidence < LOW_CONFIDENCE:
        return int(manual)
    if confidence >= HIGH_CONFIDENCE:
        return int(base * confidence)
    # Case 2: 0.40 <= confidence < 0.75
    return int(base * 0.6)


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
    
    Returns:
        dict: waste_type, confidence, base_points, points_to_earn, all_probabilities
    """
    detector = get_waste_detector(model_path)
    result = detector.predict(image_path)
    waste_type = result["waste_type"]
    confidence = result["confidence"]
    result["base_points"] = detector.get_base_points(waste_type)
    result["points_to_earn"] = calculate_points(waste_type, confidence)
    result["estimated_value"] = result["base_points"]  # kept for backward compatibility
    return result