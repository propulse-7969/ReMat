import math
import requests

def haversine(a, b):
    R = 6371  
    lat1, lon1 = math.radians(a["lat"]), math.radians(a["lng"])
    lat2, lon2 = math.radians(b["lat"]), math.radians(b["lng"])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    h = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    return 2 * R * math.asin(math.sqrt(h))


def optimize_order(start, bins):
    ordered = []
    current = start
    remaining = bins.copy()

    while remaining:
        nearest = min(
            remaining,
            key=lambda b: haversine(
                {"lat": current["lat"], "lng": current["lng"]},
                {"lat": b["lat"], "lng": b["lng"]}
            )
        )
        ordered.append(nearest)
        remaining.remove(nearest)
        current = nearest

    return ordered


def call_osrm_route(points):
    coords = ";".join([f"{p['lng']},{p['lat']}" for p in points])

    url = f"http://router.project-osrm.org/route/v1/driving/{coords}"
    params = {
        "overview": "full",
        "geometries": "geojson"
    }

    res = requests.get(url, params=params, timeout=10)

    if res.status_code != 200:
        raise Exception("OSRM request failed")

    data = res.json()

    if "routes" not in data or not data["routes"]:
        raise Exception("No route found")

    return data["routes"][0]["geometry"]["coordinates"]



