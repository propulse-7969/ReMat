import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../../components/MapView";

interface Location {
  lat: number;
  lng: number;
}

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const AddBin = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [status, setStatus] = useState("active");

  const [location, setLocation] = useState<Location | null>(null);

  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);


  const searchAddress = async (query: string) => {
    if (query.length < 3) return [];

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          query
        )}`
      );
      return await res.json();
    } 
    catch {
      return [];
    } 
    finally {
      setSearching(false);
    }
  };


  const geocodeFinalAddress = async (query: string): Promise<Location | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      if (!data || data.length === 0) return null;

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } 
    catch {
      return null;
    }
  };


  const handleSubmit = async () => {
    setError(null);

    if (!name) {
      setError("Please enter a bin name.");
      return;
    }

    let finalLocation = location;

    if (!finalLocation && address) {
      const resolved = await geocodeFinalAddress(address);
      if (resolved) {
        finalLocation = resolved;
        setLocation(resolved);
      } else {
        setError(
          "Unable to determine location from the entered address. Please select a suggestion or click on the map."
        );
        return;
      }
    }

    if (!finalLocation) {
      setError("Please select a location using address search or map click.");
      return;
    }

    setSubmitting(true);

    try {
      await fetch("http://127.0.0.1:8000/api/bins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          capacity,
          status,
          lat: finalLocation.lat,
          lng: finalLocation.lng
        })
      });

      alert("Bin created successfully");
      navigate("/admin/bins");
    } 
    catch (err) {
      console.error("Create bin failed", err);
      setError("Failed to create bin. Please try again.");
    } 
    finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 600 }}>
      <h1>Add New Bin</h1>

      <label>Bin Name</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Campus Main Gate Bin"
      />

      <label>Capacity</label>
      <input
        type="number"
        value={capacity}
        onChange={e => setCapacity(Number(e.target.value))}
      />

      <label>Status</label>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option value="active">Active</option>
        <option value="maintenance">Under Maintenance</option>
        <option value="full">Full</option>
      </select>


      <label>Search Address</label>
      <input
        value={address}
        onChange={async e => {
          const val = e.target.value;
          setAddress(val);
          setLocation(null);

          if (val.length >= 3) {
            const results = await searchAddress(val);
            setSuggestions(results);
          } else {
            setSuggestions([]);
          }
        }}
        placeholder="Type address or landmark"
      />

      {searching && <p>Searching address…</p>}

      {suggestions.length > 0 && (
        <ul
          style={{
            border: "1px solid #ccc",
            borderRadius: 4,
            maxHeight: 160,
            overflowY: "auto",
            marginTop: 4
          }}
        >
          {suggestions.map(item => (
            <li
              key={item.place_id}
              style={{ padding: 6, cursor: "pointer" }}
              onClick={() => {
                setAddress(item.display_name);
                setLocation({
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon)
                });
                setSuggestions([]);
              }}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}


      <h3 style={{ marginTop: 20 }}>
        Or Select Location on Map
      </h3>

      <MapView
        bins={
          location
            ? [{ id: "preview", lat: location.lat, lng: location.lng }]
            : []
        }
        center={location ? [location.lat, location.lng] : undefined}
        zoom={location ? 16 : 13}
        height="400px"
        onMapClick={(coords: Location) => {
          setLocation(coords);
          setSuggestions([]);
        }}
        showPopup={false}
      />

      {location && (
        <p>
          Selected Location: {location.lat.toFixed(5)},{" "}
          {location.lng.toFixed(5)}
        </p>
      )}


      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}


      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ marginTop: 20 }}
      >
        {submitting ? "Creating…" : "Create Bin"}
      </button>
    </div>
  );
};

export default AddBin;
