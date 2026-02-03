from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_model
from app.models import transaction as txn_model

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/me")
def get_user(user_id: str, db: Session=Depends(get_db)):
    return db.query(user_model.User).filter_by(id=user_id).first()



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
    return (
        db.query(user_model.User.id, user_model.User.name, user_model.User.points)
        .order_by(user_model.User.points.desc())
        .limit(50)
        .all()
    )

