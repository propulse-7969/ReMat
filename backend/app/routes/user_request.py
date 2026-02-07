from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from uuid import UUID

from app.database import get_db
from app.models.pickup_request import PickupRequest
from app.models.enums import PickupStatus
from app.models.schemas.pickup_requests import (
    PickupRequestCreate,
    PickupRequestOut,
    PickupRequestDetailsOut,
    PickupRequestUpdateLocation,
)
from app.services.geo_utils import make_geography_point
from app.services.storage import upload_pickup_image, delete_pickup_image

router = APIRouter(prefix="/user/pickup-requests", tags=["User Pickup Requests"])


@router.get("", response_model=list[PickupRequestOut])
def get_my_pickup_requests(
    user_id: str,
    db: Session = Depends(get_db),
):
    return (
        db.query(PickupRequest)
        .filter(PickupRequest.user_id == user_id)
        .order_by(PickupRequest.created_at.desc())
        .all()
    )

@router.get("/{requestId}",response_model=PickupRequestDetailsOut)
def get_pickup_request(requestId: UUID, db:Session=Depends(get_db)):
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
        {"id": str(requestId)}
    ).mappings().first()

    if not result:
        raise HTTPException(404, "Pickup request not found")

    return result


@router.post("", response_model=PickupRequestOut)
def create_pickup_request(
    user_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    preferred_datetime: str = Form(...),
    contact_number: str = Form(...),
    address_text: str | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        image_url = upload_pickup_image(image, str(user_id))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to upload image. Please try again."
        )

    

    pickup = PickupRequest(
        user_id=user_id,
        image_url=image_url,
        location=make_geography_point(latitude, longitude),
        preferred_datetime=preferred_datetime,
        contact_number=contact_number,
        address_text=address_text,
        status=PickupStatus.open
    )

    db.add(pickup)
    db.commit()
    db.refresh(pickup)

    return pickup


@router.patch("/{request_id}/location", response_model=PickupRequestDetailsOut)
def update_pickup_location(
    request_id: UUID,
    user_id: str = Query(..., description="User ID"),
    data: PickupRequestUpdateLocation = ...,
    db: Session = Depends(get_db),
):
    pickup = (
        db.query(PickupRequest)
        .filter(
            PickupRequest.id == request_id,
            PickupRequest.user_id == user_id,
        )
        .first()
    )
    if not pickup:
        raise HTTPException(404, "Pickup request not found")
    if pickup.status != PickupStatus.open:
        raise HTTPException(400, "Only open requests can be updated")

    pickup.location = make_geography_point(data.latitude, data.longitude)
    if data.address_text is not None:
        pickup.address_text = data.address_text
    db.commit()
    db.refresh(pickup)

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
        {"id": str(request_id)},
    ).mappings().first()
    return result


@router.delete("/{request_id}")
def delete_pickup_request(
    user_id: str,
    request_id: UUID,
    db: Session = Depends(get_db),
):
    pickup = (
        db.query(PickupRequest)
        .filter(
            PickupRequest.id == request_id,
            PickupRequest.user_id == user_id
        )
        .first()
    )

    if not pickup:
        raise HTTPException(404, "Pickup request not found")

    if pickup.status != PickupStatus.open:
        raise HTTPException(400, "Only open requests can be deleted")

    image_url = pickup.image_url
    db.delete(pickup)
    db.commit()

    if image_url:
        delete_pickup_image(image_url)

    return {"message": "Pickup request deleted"}
