from geoalchemy2.functions import ST_MakePoint, ST_SetSRID


def make_geography_point(latitude: float, longitude: float):
    return ST_SetSRID(
        ST_MakePoint(longitude, latitude),
        4326
    )
