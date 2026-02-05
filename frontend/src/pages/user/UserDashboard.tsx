import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import MapView from "../components/MapView";
import type { Bin } from "../../types";

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";

const UserDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bins/`);
        if (res.ok) {
          const data = await res.json();
          const remoteBins: Bin[] = (data.bins ?? []).map((b: { id: string; name?: string; lat: number; lng: number; status?: string; fill_level?: number; capacity?: number }) => ({
            id: b.id,
            name: b.name,
            lat: Number(b.lat),
            lng: Number(b.lng),
            status: b.status,
            fill_level: b.fill_level,
            capacity: b.capacity,
          }));
          setBins(remoteBins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBins();
  }, []);

  const activeBins = bins.filter((b) => b.status === "active");
  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : bins.length > 0
      ? [bins[0].lat, bins[0].lng]
      : [25.26, 82.98];

  if (!profile) {
    return <div className="p-6">Setting up your account…</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">
        Hello {profile.name} 👋
      </h1>
      <p className="text-gray-600 mb-6">
        Welcome to the Smart E-Waste System
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Your Points</p>
          <p className="text-xl font-bold text-green-600">
            {profile.points ?? 0} pts
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Active Bins Nearby</p>
          <p className="text-xl font-bold">{activeBins.length}</p>
        </div>
      </div>

      {/* Recycle CTA */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/user/recycle")}
          className="w-full py-4 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          ♻️ Recycle Now
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Scan waste, earn points
        </p>
      </div>

      {/* Nearby Bins Map */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Nearby Bins</h2>
        {loading ? (
          <p className="text-gray-500">Loading bins…</p>
        ) : bins.length === 0 ? (
          <p className="text-gray-500">No bins available yet.</p>
        ) : (
          <div className="rounded-lg overflow-hidden border">
            <MapView
              bins={bins}
              center={mapCenter}
              zoom={13}
              height="280px"
              showPopup={true}
              userLocation={userLocation ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
