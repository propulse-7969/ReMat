from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from sqlalchemy.sql import text

from pydantic import BaseModel

class CreateBinPayload(BaseModel):
    name: str
    lat: float
    lng: float
    capacity: int = 100
    status: str = "active"

router = APIRouter(prefix="/api/bins", tags=["Bins"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_all_bins(db: Session = Depends(get_db)):
    query = text("""
        SELECT
            id,
            name,
            fill_level,
            capacity,
            status,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng,
            created_at
        FROM bins
        ORDER BY created_at DESC
    """)

    result = db.execute(query).mappings().all()

    return {
        "bins": result
    }


@router.get("/{bin_id}")
def get_bin_by_id(bin_id: str, db: Session = Depends(get_db)):
    query = text("""
        SELECT
            id,
            name,
            fill_level,
            capacity,
            status,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng,
            created_at
        FROM bins
        WHERE id = :bin_id
    """)

    result = db.execute(query, {"bin_id": bin_id}).mappings().first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bin not found"
        )

    return result


@router.post("/")
def create_bin(
    payload: CreateBinPayload,
    db: Session = Depends(get_db)
):
    query = text("""
        INSERT INTO bins (
            name,
            location,
            capacity,
            fill_level,
            status
        )
        VALUES (
            :name,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326),
            :capacity,
            0,
            :status
        )
        RETURNING id
    """)

    result = db.execute(query, {
        "name": payload.name,
        "lat": payload.lat,
        "lng": payload.lng,
        "capacity": payload.capacity,
        "status": payload.status
    }).fetchone()

    db.commit()

    return {
        "message": "Bin created successfully",
        "bin_id": result[0]
    }


@router.put("/{bin_id}")
def update_bin(
    bin_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    query = text("""
        UPDATE bins
        SET
            name = COALESCE(:name, name),
            capacity = COALESCE(:capacity, capacity),
            status = COALESCE(:status, status)
        WHERE id = :bin_id
    """)

    db.execute(query, {
        "bin_id": bin_id,
        "name": payload.get("name"),
        "capacity": payload.get("capacity"),
        "status": payload.get("status")
    })

    db.commit()

    return {"message": "Bin updated successfully"}


@router.delete("/{bin_id}")
def delete_bin(bin_id: str, db: Session = Depends(get_db)):
    query = text("""
        DELETE FROM bins
        WHERE id = :bin_id
    """)

    db.execute(query, {"bin_id": bin_id})
    db.commit()

    return {"message": "Bin deleted successfully"}


@router.get("/nearby")
def get_nearby_bins(
    lat: float = Query(...),
    lng: float = Query(...),
    limit: int = 5,
    db: Session = Depends(get_db)
):
    query = text("""
        select
          id,
          name,
          fill_level,
          capacity,
          ST_Distance(
            location,
            ST_GeogFromText(:point)
          ) as distance
        from bins
        where status = 'active'
          and fill_level < capacity
        order by distance
        limit :limit
    """)

    point = f"POINT({lng} {lat})"

    result = db.execute(query, {
        "point": point,
        "limit": limit
    }).mappings().all()

    return result


TODO = "ADD INTERFACE DISPLAY OF THE BIN CORRESPONDING TO BIN ID"