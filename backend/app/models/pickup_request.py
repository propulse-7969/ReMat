import uuid
from sqlalchemy import (Column, String, Integer, DateTime, Enum, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geography

from app.database import Base
from app.models.enums import PickupStatus


class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(String,nullable=False)

    image_url = Column(String, nullable=False)

    location = Column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=False
    )

    address_text = Column(String)
    rejection_reason = Column(String)
    e_waste_type = Column(String)

    preferred_datetime = Column(
        DateTime(timezone=True),
        nullable=False
    )

    contact_number = Column(String, nullable=False)

    status = Column(
        Enum(PickupStatus, name="pickup_status"),
        nullable=False,
        default=PickupStatus.open
    )

    points_awarded = Column(Integer)

    admin_id = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )