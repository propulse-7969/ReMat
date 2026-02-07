from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class PickupRequestBase(BaseModel):
    preferred_datetime: datetime
    contact_number: str
    address_text: Optional[str] = None


class PickupRequestCreate(PickupRequestBase):
    latitude: float
    longitude: float


class PickupRequestCancel(BaseModel):
    reason: Optional[str] = None


class PickupRequestAccept(BaseModel):
    points_awarded: int


class PickupRequestReject(BaseModel):
    reason: Optional[str] = None


class PickupRequestUpdateLocation(BaseModel):
    latitude: float
    longitude: float
    address_text: Optional[str] = None


class PickupRequestOut(BaseModel):
    id: UUID
    image_url: str
    e_waste_type: Optional[str] = None

    preferred_datetime: datetime
    contact_number: str
    status: str
    points_awarded: Optional[int]

    created_at: datetime

    class Config:
        from_attributes = True


class PickupRequestDetailsOut(BaseModel):
    id: UUID
    image_url: str
    e_waste_type: Optional[str] = None

    preferred_datetime: datetime
    contact_number: str
    status: str
    points_awarded: Optional[int]

    address_text: Optional[str]
    rejection_reason: Optional[str]

    latitude: float
    longitude: float

    created_at: datetime