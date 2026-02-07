import type { PickupRequest } from "../../../types";

interface Props {
  pickup: PickupRequest;
  onClick: () => void;
}

const statusColor: Record<string, string> = {
  open: "gray",
  accepted: "green",
  rejected: "red",
  cancelled: "orange"
};

const PickupCard = ({ pickup, onClick }: Props) => {
  return (
    <div className="text-white"
      onClick={onClick}
      style={{ border: "1px solid #ccc", padding: 12, marginBottom: 8, cursor: "pointer" }}
    >
      <h4>{pickup.e_waste_type}</h4>
      <p>
        Status:{" "}
        <span style={{ color: statusColor[pickup.status] }}>
          {pickup.status}
        </span>
      </p>
      <p>
        {new Date(pickup.preferred_datetime).toLocaleString()}
      </p>
    </div>
  );
};

export default PickupCard;
