import type { DetectionResult } from "../../types";

type ConfirmationProps = {
  result: DetectionResult;
  binId: string;
  binName?: string;
  onAccept: () => void | Promise<void>;
  onReject: () => void;
  loading?: boolean;
};

const Confirmation = ({
  result,
  binId,
  binName,
  onAccept,
  onReject,
  loading = false,
}: ConfirmationProps) => {
  const pointsToEarn = result.points_to_earn ?? result.estimated_value ?? 0;

  return (
    <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Transaction Details</h3>
      <p><strong>Waste Type:</strong> {result.waste_type}</p>
      <p><strong>Base Points:</strong> {result.base_points ?? result.estimated_value ?? 0}</p>
      <p><strong>Points to Earn:</strong> {pointsToEarn}</p>
      <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
      <p><strong>Bin:</strong> {binName || binId}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={onAccept} disabled={loading}>
          {loading ? "Processing..." : "Accept"}
        </button>
        <button onClick={onReject} disabled={loading}>
          Reject
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
