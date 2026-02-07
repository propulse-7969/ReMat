import { useState, useMemo } from "react";
import MapView from "../MapView";
import type { Bin } from "../../../types";

interface Props {
  userId: string;
  onSuccess: () => void;
}

type Location = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: [number, number] = [25.26, 82.98];

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}

const PickupForm = ({ userId, onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("");
  const [phone, setPhone] = useState("");
  const [datetime, setDatetime] = useState("");

  const [location, setLocation] = useState<Location | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);


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
    } catch {
      return [];
    } finally {
      setSearching(false);
    }
  };

  const geocodeFinalAddress = async (
    query: string
  ): Promise<Location | null> => {
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
    } catch {
      return null;
    }
  };


  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => alert("Failed to get current location")
    );
  };

  const handleAddressChange = async (value: string) => {
    setAddressQuery(value);
    setLocation(null);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const results = await searchAddress(value);
    setSuggestions(results);
  };

  const selectAddress = async (displayName: string) => {
    setAddressQuery(displayName);
    setSuggestions([]);

    const loc = await geocodeFinalAddress(displayName);
    if (!loc) {
      alert("Failed to resolve address");
      return;
    }

    setLocation(loc);
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    setLocation({ lat: coords.lat, lng: coords.lng });
    const name = await reverseGeocode(coords.lat, coords.lng);
    if (name) setAddressQuery(name);
  };

  const pickupBin: Bin | undefined = useMemo(() => {
    if (!location) return undefined;
    return {
      id: "pickup",
      lat: location.lat,
      lng: location.lng,
      name: "Pickup location",
      status: "active",
    };
  }, [location]);

  const mapCenter: [number, number] = location
    ? [location.lat, location.lng]
    : DEFAULT_CENTER;

  const submit = async () => {
    if (!file) return alert("Please upload an image");
    if (!location) return alert("Please select a pickup location");

    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("e_waste_type", type);
    fd.append("contact_number", phone);
    fd.append("preferred_datetime", datetime);
    fd.append("latitude", String(location.lat));
    fd.append("longitude", String(location.lng));
    fd.append("image", file);

    const res = await fetch(`${BASE_URL}/user/pickup-requests`, {
      method: "POST",
      body: fd
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg || "Failed to create pickup request");
      return;
    }

    onSuccess();
  };


  return (
    <div className="text-white">
      <h3>➕ Request Pickup</h3>

      <input
        placeholder="E-waste type (e.g. Washing Machine)"
        value={type}
        onChange={e => setType(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <input
        placeholder="Phone number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />

      <input
        type="datetime-local"
        value={datetime}
        onChange={e => setDatetime(e.target.value)}
      />

      <hr />

      <h4>📍 Pickup Location</h4>

      <button type="button" onClick={useCurrentLocation}>
        Use Current Location
      </button>

      <input
        placeholder="Search address"
        value={addressQuery}
        onChange={e => handleAddressChange(e.target.value)}
      />

      {searching && <p>Searching…</p>}

      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((s, i) => (
            <li
              key={i}
              style={{ cursor: "pointer" }}
              onClick={() => selectAddress(s.display_name)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}

      {location && (
        <p>
          ✅ Location selected: {location.lat.toFixed(4)},{" "}
          {location.lng.toFixed(4)}
        </p>
      )}

      <p className="mt-2 mb-1 font-medium">Or click on the map to set pickup location:</p>
      <div style={{ height: "280px", width: "100%", borderRadius: 8, overflow: "hidden" }}>
        <MapView
          bins={pickupBin ? [pickupBin] : []}
          center={mapCenter}
          zoom={location ? 15 : 12}
          height="100%"
          showPopup={true}
          onMapClick={handleMapClick}
        />
      </div>

      <button onClick={submit}>Submit</button>
    </div>
  );
};

export default PickupForm;
