from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_model
from app.models import transaction as txn_model

router = APIRouter(prefix="/user", tags=["User"])

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

@router.get("/detect-waste")
def detect_waste():
    #TODO -> IMPLEMENT MODEL and RETURN PREDICTED VALUE
        return {
        "waste_type": "phone",
        "confidence": 0.91,
        "estimated_value": 120
    }
        
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