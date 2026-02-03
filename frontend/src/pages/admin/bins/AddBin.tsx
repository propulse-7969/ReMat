import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../../components/MapView";

export default function AddBin() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [status, setStatus] = useState("active");
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !location) {
      alert("Please provide bin name and select a location on the map");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/bins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          capacity,
          status,
          lat: location.lat,
          lng: location.lng
        })
      });

      if(!res.ok) {
        alert("An error occured during bin creation")
        return
      }

      alert("Bin created successfully");
      navigate("/admin/dashboard");
    } 
    catch (err) {
      console.error("Failed to create bin", err);
      alert("Failed to create bin");
    } 
    finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Add New Bin</h1>

      {/* FORM */}
      <div style={{ maxWidth: 400 }}>
        <label>Bin Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Campus Main Gate Bin"
          required
        />

        <label>Capacity</label>
        <input
          type="number"
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
          required
        />

        <label>Status</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* MAP */}
      <h3 style={{ marginTop: 20 }}>
        Select Bin Location
      </h3>

      <MapView
        bins={location ? [{ id: "preview", lat: location.lat, lng: location.lng }] : []}
        onMapClick={(coords: { lat: number; lng: number }) => setLocation(coords)}
        height="400px"
        showPopup={false}
      />

      {location && (
        <p>
          Selected Location: {location.lat.toFixed(5)},{" "}
          {location.lng.toFixed(5)}
        </p>
      )}

      {/* ACTIONS */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ marginTop: 20 }}
      >
        {submitting ? "Creating..." : "Create Bin"}
      </button>
    </div>
  );
};
