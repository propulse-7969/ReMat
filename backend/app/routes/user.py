from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pathlib import Path
from app.database import get_db
from app.models import user as user_model
from app.models import transaction as txn_model
import os
from datetime import datetime
import shutil
from app.services.waste_detector import predict_waste

router = APIRouter(prefix="/user", tags=["User"])

# Upload path relative to backend root (works regardless of cwd)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
UPLOAD_FOLDER = str(_BACKEND_ROOT / "uploads" / "waste_images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.get("/me")
def get_me(user_id: str, db: Session = Depends(get_db)):
    user = (
        db.query(user_model.User)
        .filter(user_model.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.post("/detect-waste")
async def detect_waste(image: UploadFile = File(...)):
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    file_extension = image.filename.split('.')[-1].lower() if image.filename else ''
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Allowed: png, jpg, jpeg, gif, webp"
        )
    
    filepath = None
    
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"waste_{timestamp}.{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save uploaded file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Predict using the model
        prediction_result = predict_waste(filepath)
        
        return {
            "waste_type": prediction_result["waste_type"],
            "confidence": prediction_result["confidence"],
            "estimated_value": prediction_result["estimated_value"],
            "image_path": filepath,
            "all_probabilities": prediction_result.get("all_probabilities", {})
        }
        
    except Exception as e:
        # Clean up the uploaded file if something goes wrong
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process image: {str(e)}"
        )
    finally:
        await image.close()

@router.get("/transactions/{user_id}")
def get_transactions(user_id: str, page: int=1, limit: int=10,  db: Session = Depends(get_db)):
    offset = (page-1)*limit
    transactions = (
        db.query(txn_model.Transaction)
        .filter(txn_model.Transaction.user_id == user_id)
        .order_by(txn_model.Transaction.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return transactions


@router.get("/leaderboard")
def leaderboard(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    offset = (page - 1) * limit

    results = (
        db.query(user_model.User)
        .order_by(user_model.User.points.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "points": user.points,
        }
        for user in results
    ]
    

@router.put("/recycle/{binid}")
def perform_transaction():
    pass