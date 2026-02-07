import { useState } from "react";
import type { PickupRequest } from "../../../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface Props {
  pickup: PickupRequest;
  adminId: string;
  onClose: () => void;
  onAction: () => void;
}

const AdminPickupDetails = ({
  pickup,
  adminId,
  onClose,
  onAction
}: Props) => {
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    if (!points) {
      alert("Enter points to award");
      return;
    }

    setLoading(true);

    const url = `${BASE_URL}/admin/pickup-requests/${pickup.id}/accept?admin_id=${encodeURIComponent(adminId)}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points_awarded: Number(points) })
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to accept request");
      return;
    }

    onAction();
  };

  const reject = async () => {
    setLoading(true);

    const url = `${BASE_URL}/admin/pickup-requests/${pickup.id}/reject?admin_id=${encodeURIComponent(adminId)}`;
    const res = await fetch(url, {
      method: "PATCH"
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to reject request");
      return;
    }

    onAction();
  };

  return (
    <div style={{ border: "2px solid black", padding: 16 }}>
      <button onClick={onClose}>❌ Close</button>

      <h3>{pickup.e_waste_type ?? "E-waste"}</h3>

      <img src={pickup.image_url} alt="e-waste" width={300} />

      <p>Status: {pickup.status}</p>
      <p>Phone: {pickup.contact_number}</p>
      <p>Address: {pickup.address_text ?? "—"}</p>
      <p>
        Preferred pickup:{" "}
        {new Date(pickup.preferred_datetime).toLocaleString()}
      </p>
      {pickup.latitude != null && pickup.longitude != null && (
        <p>
          Coordinates: {pickup.latitude.toFixed(4)}, {pickup.longitude.toFixed(4)}
        </p>
      )}

      {pickup.status === "open" && (
        <>
          <input
            placeholder="Points to award"
            value={points}
            onChange={e => setPoints(e.target.value)}
          />

          <div style={{ marginTop: 10 }}>
            <button disabled={loading} onClick={accept}>
              ✅ Accept
            </button>
            <button disabled={loading} onClick={reject}>
              ❌ Reject
            </button>
          </div>
        </>
      )}

      {pickup.status === "accepted" && (
        <p>✅ Accepted — {pickup.points_awarded} points awarded</p>
      )}

      {pickup.status === "rejected" && (
        <p>❌ Rejected</p>
      )}
    </div>
  );
};

export default AdminPickupDetails;
