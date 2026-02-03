from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import bin as bin_model
from app.services.transaction_service import handle_deposit

router = APIRouter(prefix="/bin/panel", tags=["Bin Panel"])

@router.get("/{bin_id}")
def get_bin(bin_id: str, db: Session = Depends(get_db)):
    return db.query(bin_model.Bin).filter_by(id=bin_id).first()


@router.post("/{bin_id}/confirm")
def confirm_deposit(
    bin_id: str,
    user_id: str,
    waste_type: str,
    estimated_value: float,
    db: Session = Depends(get_db)
):
    return handle_deposit(
        db=db,
        user_id=user_id,
        bin_id=bin_id,
        waste_type=waste_type,
        estimated_value=estimated_value
    )
