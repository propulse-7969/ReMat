from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True)

    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    bin_id = Column(
        UUID(as_uuid=True),
        ForeignKey("bins.id", ondelete="RESTRICT"),
        nullable=False
    )

    waste_type = Column(String, nullable=False) 

    confidence = Column(Numeric(5, 2), nullable=True)
    points_awarded = Column(Integer, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
