import type { PickupRequest } from "../../../types";

interface Props {
  pickup: PickupRequest;
  onClick: () => void;
}

const AdminPickupCard = ({ pickup, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #aaa",
        padding: 12,
        marginBottom: 10,
        cursor: "pointer"
      }}
    >
      <h4>{pickup.e_waste_type ?? "E-waste"}</h4>
      <p>Status: {pickup.status}</p>
      <p>
        Requested on:{" "}
        {new Date(pickup.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default AdminPickupCard;
