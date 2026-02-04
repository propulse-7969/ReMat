import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../../components/MapView";

interface Bin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  fill_level: number;
  status: string;
  created_at: string;
}

const ViewBins = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/bins")
      .then(res => res.json())
      .then(data => {
        setBins(data.bins || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch bins", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading bins...</p>;
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <button onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</button>
      <h1>View All Bins</h1>

      {/* TABLE */}
      <table
        border={1}
        cellPadding={10}
        style={{ width: "100%", marginTop: 20 }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Capacity</th>
            <th>Fill Level</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bins.map(bin => (
            <tr
              key={bin.id}
              style={{
                background:
                  selectedBin?.id === bin.id ? "#f0f8ff" : "transparent"
              }}
            >
              <td>{bin.name}</td>
              <td>{bin.capacity}</td>
              <td>{bin.fill_level}%</td>
              <td>{bin.status}</td>
              <td>
                {new Date(bin.created_at).toLocaleString()}
              </td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSelectedBin(bin)}>
                  Show on Map
                </button>
                <button
                  onClick={() =>
                    navigate(`/admin/bins/${bin.id}`)
                  }
                >
                  View / Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MAP */}
      <h2 style={{ marginTop: 30 }}>
        {selectedBin ? "Selected Bin Location" : "Select a bin to view on map"}
      </h2>

      <MapView
        bins={selectedBin ? [selectedBin] : []}
        center={
          selectedBin
            ? [selectedBin.lat, selectedBin.lng]
            : [25.26, 82.98]
        }
        zoom={selectedBin ? 16 : 13}
        height="400px"
      />
    </div>
  );
};

export default ViewBins;
