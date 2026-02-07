from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from uuid import UUID

from app.database import get_db
from app.models.pickup_request import PickupRequest
from app.models.user import User
from app.models.enums import PickupStatus
from app.models.schemas.pickup_requests import (
    PickupRequestOut,
    PickupRequestAccept,
    PickupRequestDetailsOut,
)


router = APIRouter(prefix="/admin/pickup-requests", tags=["Admin Pickup Requests"])

@router.get("", response_model=list[PickupRequestOut])
def get_admin_pickup_requests(db: Session = Depends(get_db)):
    return (
        db.query(PickupRequest)
        .filter(
            PickupRequest.status.in_([
                PickupStatus.open,
                PickupStatus.accepted,
                PickupStatus.rejected
            ])
        )
        .order_by(PickupRequest.created_at.desc())
        .all()
    )


@router.get("/{request_id}", response_model=PickupRequestDetailsOut)
def get_admin_pickup_request_by_id(
    request_id: UUID,
    db: Session = Depends(get_db),
):
    result = db.execute(
        text("""
            SELECT
                id,
                image_url,
                e_waste_type,
                preferred_datetime,
                contact_number,
                status,
                points_awarded,
                rejection_reason,
                address_text,
                created_at,
                ST_Y(location::geometry) AS latitude,
                ST_X(location::geometry) AS longitude
            FROM pickup_requests
            WHERE id = :id
        """),
        {"id": str(request_id)}
    ).mappings().first()

    if not result:
        raise HTTPException(404, "Pickup request not found")

    return result


@router.patch("/{request_id}/accept")
def accept_pickup_request(
    request_id: UUID,
    admin_id: str = Query(..., description="Admin user ID"),
    data: PickupRequestAccept = ...,
    db: Session = Depends(get_db),
):
    pickup = (
        db.query(PickupRequest)
        .filter(PickupRequest.id == request_id)
        .first()
    )

    if not pickup:
        raise HTTPException(404, "Pickup request not found")

    if pickup.status != PickupStatus.open:
        raise HTTPException(400, "Request already processed")

    pickup.status = PickupStatus.accepted
    pickup.points_awarded = data.points_awarded
    pickup.admin_id = admin_id

    user = db.query(User).filter(User.id == pickup.user_id).first()
    if user:
        user.points += data.points_awarded

    db.commit()

    return {"message": "Pickup request accepted"}


@router.patch("/{request_id}/reject")
def reject_pickup_request(
    request_id: UUID,
    admin_id: str = Query(..., description="Admin user ID"),
    db: Session = Depends(get_db),
):
    pickup = db.query(PickupRequest).filter(
        PickupRequest.id == request_id
    ).first()

    if not pickup:
        raise HTTPException(404, "Pickup request not found")

    if pickup.status != PickupStatus.open:
        raise HTTPException(400, "Request already processed")

    pickup.status = PickupStatus.rejected
    pickup.admin_id = admin_id

    db.commit()

    return {"message": "Pickup request rejected"}
