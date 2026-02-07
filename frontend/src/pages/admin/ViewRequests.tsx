import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import AdminPickupCard from "../components/AdminPickup/AdminPickupCard";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type Tab = "pending" | "accepted" | "rejected";

const AdminPickups = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}/admin/pickup-requests`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch admin pickups");
        return res.json();
      })
      .then((data: PickupRequest[]) => setPickups(data))
      .catch(console.error);
  }, []);

  const pending = pickups.filter((p) => p.status === "open");
  const accepted = pickups.filter((p) => p.status === "accepted");
  const rejected = pickups.filter((p) => p.status === "rejected");

  const list =
    tab === "pending" ? pending : tab === "accepted" ? accepted : rejected;

  return (
    <div className="text-white">
      <h2>Admin Pickup Requests</h2>

      <div role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pending"}
          onClick={() => setTab("pending")}
        >
          Pending ({pending.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "accepted"}
          onClick={() => setTab("accepted")}
        >
          Accepted ({accepted.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "rejected"}
          onClick={() => setTab("rejected")}
        >
          Rejected ({rejected.length})
        </button>
      </div>

      <div>
        {list.length === 0 ? (
          <p>No {tab} requests.</p>
        ) : (
          list.map((pickup) => (
            <AdminPickupCard
              key={pickup.id}
              pickup={pickup}
              onClick={() => navigate(`/admin/pickup-requests/${pickup.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPickups;
