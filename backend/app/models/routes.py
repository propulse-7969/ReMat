from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

class Location(BaseModel):
    lat: float
    lng: float

class OptimizeRoutePayload(BaseModel):
    start: Location
    bins: List[Location]
