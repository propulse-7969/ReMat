import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import type { Bin } from "../../types";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}

const PickupDetails = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [pickup, setPickup] = useState<PickupRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    fetch(`${BASE_URL}/user/pickup-requests/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pickup details");
        return res.json();
      })
      .then((data: PickupRequest) => setPickup(data))
      .catch(console.error);
  }, [requestId]);

  const handleCancel = async () => {
    if (!requestId || !profile?.uid) return;
    if (!confirm("Cancel this request? It will be permanently deleted.")) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${BASE_URL}/user/pickup-requests/${requestId}?user_id=${encodeURIComponent(profile.uid)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to delete request");
      }
      navigate("/user/pickup-requests", { replace: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete request");
    } finally {
      setDeleting(false);
    }
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    if (!requestId || !profile?.uid || pickup?.status !== "open") return;

    setUpdatingLocation(true);
    try {
      const address_text = await reverseGeocode(coords.lat, coords.lng);
      const res = await fetch(
        `${BASE_URL}/user/pickup-requests/${requestId}/location?user_id=${encodeURIComponent(profile.uid)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: coords.lat,
            longitude: coords.lng,
            address_text: address_text ?? undefined,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Failed to update location");
      }
      const updated: PickupRequest = await res.json();
      setPickup(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update location");
    } finally {
      setUpdatingLocation(false);
    }
  };

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

  const mapCenter: [number, number] | undefined =
    pickup?.latitude != null && pickup?.longitude != null
      ? [pickup.latitude, pickup.longitude]
      : undefined;

  if (!pickup) return <p>Loading...</p>;

  return (
    <div className="text-white">
      <h2>{pickup.e_waste_type ?? "Not available"}</h2>

      <img src={pickup.image_url} alt="e-waste" width={300} />

      <p>Status: <strong>{pickup.status}</strong></p>
      <p>{new Date(pickup.preferred_datetime).toLocaleString()}</p>
      <p>Contact: {pickup.contact_number}</p>
      <p>Pickup Location: {pickup.address_text ?? "Address not set"}</p>

      {pickup.latitude != null && pickup.longitude != null && (
        <p>
          Coordinates: {pickup.latitude.toFixed(4)}, {pickup.longitude.toFixed(4)}
        </p>
      )}

      {mapCenter && pickupBin && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <p className="mb-2 font-semibold">Map</p>
          {pickup.status === "open" && (
            <p className="text-sm text-white/80 mb-2">
              Click on the map to set a new pickup location.
            </p>
          )}
          <div style={{ height: "320px", width: "100%", borderRadius: 8, overflow: "hidden" }}>
            <MapView
              bins={[pickupBin]}
              center={mapCenter}
              zoom={15}
              height="100%"
              showPopup={true}
              onMapClick={pickup.status === "open" ? handleMapClick : undefined}
            />
          </div>
          {updatingLocation && <p className="text-sm mt-1">Updating location…</p>}
        </div>
      )}

      {pickup.status === "accepted" && (
        <div>
          🎉 Thank you for recycling!
          <br />
          Points awarded: <strong>{pickup.points_awarded}</strong>
        </div>
      )}

      {pickup.status === "rejected" && (
        <div>
          ❌ Request rejected.
          <br />
          Reason: {pickup.rejection_reason ?? "Reason will be updated soon"}
        </div>
      )}

      {pickup.status === "open" && (
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            disabled={deleting}
            onClick={handleCancel}
          >
            {deleting ? "Cancelling…" : "Cancel request"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
