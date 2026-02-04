import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const BinDetails = () => {
  const { binId } = useParams();
  const navigate = useNavigate();

  const [bin, setBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/bins/${binId}`)
      .then(res => res.json())
      .then(data => {
        setBin(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch bin", err);
        setLoading(false);
      });
  }, [binId]);

  if (loading) return <p>Loading bin details...</p>;
  if (!bin) return <p>Bin not found</p>;

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/bins/${bin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: bin.name,
          capacity: bin.capacity,
          status: bin.status
        })
      });
      alert("Bin updated successfully");
    } 
    catch (err) {
      console.error("Failed to update bin", err);
      alert("Failed to update bin");
    } 
    finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bin? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await fetch(`http://127.0.0.1:8000/api/bins/${bin.id}`, {
        method: "DELETE"
      });
      alert("Bin deleted");
      navigate("/admin/bins");
    } 
    catch (err) {
      console.error("Failed to delete bin", err);
      alert("Failed to delete bin");
    } 
    finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Bin Details</h1>

      {/* BIN INFO FORM */}
      <div style={{ maxWidth: 500 }}>
        <label>Bin Name</label>
        <input
          value={bin.name}
          onChange={e => setBin({ ...bin, name: e.target.value })}
        />

        <label>Capacity</label>
        <input
          type="number"
          value={bin.capacity}
          onChange={e =>
            setBin({ ...bin, capacity: Number(e.target.value) })
          }
        />

        <label>Status</label>
        <select
          value={bin.status}
          onChange={e => setBin({ ...bin, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="maintenance">Under Maintenance</option>
          <option value="full">Full</option>
        </select>

        <label>Fill Level</label>
        <input value={`${bin.fill_level}%`} disabled />

        <label>Created At</label>
        <input
          value={new Date(bin.created_at).toLocaleString()}
          disabled
        />
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button onClick={handleUpdate} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ color: "red" }}
        >
          {deleting ? "Deleting..." : "Delete Bin"}
        </button>
      </div>

      {/* MAP */}
      <h2 style={{ marginTop: 30 }}>Bin Location</h2>
      <MapView
        bins={[bin]}
        center={[bin.lat, bin.lng]}
        zoom={16}
        height="400px"
      />
    </div>
  );
};

export default BinDetails;
