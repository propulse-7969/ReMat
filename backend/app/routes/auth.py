from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import verify_firebase_token
from app.core.config import ADMIN_EMAILS
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

from pydantic import BaseModel

class SignupPayload(BaseModel):
    name: str


@router.post("/signup")
def signup_user(payload: SignupPayload, decoded_token=Depends(verify_firebase_token), db: Session=Depends(get_db)):
    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    name = payload.name or "User"

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists. Please login."
        )
    
    role = "admin" if email in ADMIN_EMAILS else "user"

    new_user = User(
        id=uid,
        name=name,
        email=email,
        role=role,
        points=0
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "uid": new_user.id,
        "email": new_user.email,
        "role": new_user.role
    }

@router.post("/login")
def login_user(decoded_token=Depends(verify_firebase_token), db: Session=Depends(get_db)):
    email = decoded_token.get("email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sign up."
        )

    return {
        "message": "Login successful",
        "uid": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    }

@router.get("/me")
def get_current_user(decoded_token=Depends(verify_firebase_token), db: Session=Depends(get_db)):
    uid = decoded_token["uid"]

    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not registered"
        )

    return {
        "uid": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "points": user.points
    }


@router.delete("/me")
def delete_account(decoded_token=Depends(verify_firebase_token), db: Session=Depends(get_db)):
    uid = decoded_token["uid"]
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "Account deleted successfully"}