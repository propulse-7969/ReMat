import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PickupRequest } from "../../types";
import PickupForm from "../components/UserPickup/PickupForm";
import PickupCard from "../components/UserPickup/PickupCard";
import { useAuth } from "../../auth/useAuth";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"

const UserPickups = () => {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const navigate = useNavigate();
  const {profile} = useAuth()

//   console.log(BACKEND_URL)


  const userId = profile?.uid

   useEffect(() => {
    fetch(`${BACKEND_URL}/user/pickup-requests?user_id=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch pickup requests");
        return res.json();
      })
      .then((data: PickupRequest[]) => setPickups(data))
      .catch(console.error);
  }, [userId]);

  return (
    <div className="text-white">
      <h2>📦 My Pickup Requests</h2>

      {userId && <PickupForm userId={userId} onSuccess={() => window.location.reload()} />}

      <div>
        {pickups.map(pickup => (
          <PickupCard
            key={pickup.id}
            pickup={pickup}
            onClick={() => navigate(`/user/pickup-request/${pickup.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default UserPickups;
