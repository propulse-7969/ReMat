from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from sqlalchemy.sql import func
from app.database import Base


class Bin(Base):
    __tablename__ = "bins"

    id = Column(UUID(as_uuid=True), primary_key=True)

    name = Column(String, nullable=False)

    location = Column(Geography(geometry_type="POINT", srid=4326))

    capacity = Column(Integer, nullable=False)
    fill_level = Column(Integer, nullable=False, default=0)

    status = Column(String, nullable=False, default="active")
    # active | full | maintenance

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
