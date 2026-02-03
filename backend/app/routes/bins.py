from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from sqlalchemy.sql import text

router = APIRouter(prefix="/bins", tags=["Bins"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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