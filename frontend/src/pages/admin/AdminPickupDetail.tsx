import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import type { Bin } from "../../types";
import AdminPickupDetails from "../components/AdminPickup/AdminPickupDetails";
import MapView from "../components/MapView";
import { useAuth } from "../../auth/useAuth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE = BASE_URL.replace(/\/?(user|admin).*$/, "") || BASE_URL;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface AdminLocation {
  lat: number;
  lng: number;
}

const AdminPickupDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<PickupRequest | null>(null);
  const [adminLocation, setAdminLocation] = useState<AdminLocation | null>(null);
  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    fetch(`${BASE_URL}/admin/pickup-requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pickup request");
        return res.json();
      })
      .then((data: PickupRequest) => setPickup(data))
      .catch(console.error);
  }, [requestId]);

  const handleClose = () => {
    navigate("/admin/pickup-requests");
  };

  const handleAction = () => {
    navigate("/admin/pickup-requests");
  };

  const requestAdminLocation = () => {
    setRouteError(null);
    if (!navigator.geolocation) {
      setRouteError("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setAdminLocation(loc);
        setRoutePath([]);
        if (
          pickup?.latitude != null &&
          pickup?.longitude != null
        ) {
          fetchRoute(loc, pickup.latitude, pickup.longitude);
        }
      },
      () => setRouteError("Could not get your location.")
    );
  };

  const fetchRoute = async (
    start: { lat: number; lng: number },
    destLat: number,
    destLng: number
  ) => {
    setLoadingRoute(true);
    setRouteError(null);
    try {
      const res = await fetch(`${API_BASE}/api/route/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: { lat: start.lat, lng: start.lng },
          bins: [{ lat: destLat, lng: destLng }],
        }),
      });
      if (!res.ok) throw new Error("Failed to get route");
      const data = await res.json();
      setRoutePath(data.path ?? []);
    } catch {
      setRouteError("Failed to load route.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const distanceKm = useMemo(() => {
    if (
      !adminLocation ||
      pickup?.latitude == null ||
      pickup?.longitude == null
    )
      return null;
    return haversineKm(
      adminLocation.lat,
      adminLocation.lng,
      pickup.latitude,
      pickup.longitude
    );
  }, [adminLocation, pickup?.latitude, pickup?.longitude]);

  const pickupBin: Bin | undefined = useMemo(() => {
    if (pickup?.latitude == null || pickup?.longitude == null) return undefined;
    return {
      id: "pickup",
      lat: pickup.latitude,
      lng: pickup.longitude,
      name: "Pickup location",
      status: "active",
    };
  }, [pickup?.latitude, pickup?.longitude]);

  const mapCenter: [number, number] | undefined = useMemo(() => {
    if (pickup?.latitude != null && pickup?.longitude != null) {
      if (adminLocation)
        return [
          (pickup.latitude + adminLocation.lat) / 2,
          (pickup.longitude + adminLocation.lng) / 2,
        ];
      return [pickup.latitude, pickup.longitude];
    }
    return undefined;
  }, [pickup?.latitude, pickup?.longitude, adminLocation]);

  if (!pickup) return <p>Loading...</p>;

  const adminId = profile?.uid ?? "";

  return (
    <div className="text-white">
      <button type="button" onClick={handleClose}>
        Back to list
      </button>

      {pickup.latitude != null && pickup.longitude != null && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <p className="font-semibold mb-2">Map &amp; route</p>
          <button
            type="button"
            onClick={requestAdminLocation}
            disabled={loadingRoute}
          >
            {adminLocation ? "Update my location & route" : "Use my location & show route"}
          </button>
          {routeError && <p className="text-red-400 text-sm mt-1">{routeError}</p>}
          {adminLocation && distanceKm != null && (
            <p className="mt-2">
              Approx. distance to pickup: <strong>{distanceKm.toFixed(1)} km</strong>
            </p>
          )}
          {mapCenter && (
            <div style={{ height: "360px", width: "100%", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
              <MapView
                bins={pickupBin ? [pickupBin] : []}
                center={mapCenter}
                zoom={13}
                height="100%"
                showPopup={true}
                userLocation={adminLocation ?? undefined}
                routePath={routePath.length > 1 ? routePath : undefined}
              />
            </div>
          )}
        </div>
      )}

      <AdminPickupDetails
        pickup={pickup}
        adminId={adminId}
        onClose={handleClose}
        onAction={handleAction}
      />
    </div>
  );
};

export default AdminPickupDetail;
