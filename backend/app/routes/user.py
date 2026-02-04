from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_model
from app.models import transaction as txn_model
import os
from datetime import datetime
import shutil

router = APIRouter(prefix="/user", tags=["User"])

UPLOAD_FOLDER = 'uploads/waste_images'
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
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: png, jpg, jpeg, gif, webp")
    
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"waste_{timestamp}.{file_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save uploaded file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # TODO -> IMPLEMENT MODEL and RETURN PREDICTED VALUE
        # You can now use 'filepath' to load the image for your model
        # Example: from PIL import Image
        #          img = Image.open(filepath)
        #          prediction = model.predict(img)
        
        return {
            "waste_type": "100% Certified Nigga",
            "confidence": 0.99,
            "estimated_value": 1000000,
            "image_path": filepath
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")
    finally:
        await image.close()

@router.get("/transactions")
def get_transactions(user_id: str, db: Session = Depends(get_db)):
    return (
        db.query(txn_model.Transaction)
        .filter_by(user_id=user_id)
        .order_by(txn_model.Transaction.created_at.desc())
        .all()
    )


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):
    results = (
        db.query(user_model.User)
        .order_by(user_model.User.points.desc())
        .limit(10)
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