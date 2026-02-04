from ..services.routing_service import optimize_order, call_osrm_route
from fastapi import APIRouter, HTTPException
from ..models.routes import OptimizeRoutePayload


router = APIRouter(prefix="/api/route", tags=["Routes"])

@router.post("/optimize")
def optimize_route(payload: OptimizeRoutePayload):
    if not payload.bins:
        raise HTTPException(status_code=400, detail="No bins provided")


    ordered_bins = optimize_order(
        payload.start.dict(),
        [b.dict() for b in payload.bins]
    )


    route_points = [payload.start.dict()] + ordered_bins


    try:
        geometry = call_osrm_route(route_points)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    path = [{"lat": lat, "lng": lng} for lng, lat in geometry]

    return {
        "path": path,
        "stops": route_points
    }
