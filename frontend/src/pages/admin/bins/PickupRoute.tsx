import { useEffect, useState } from "react";
import MapView from "../../components/MapView";
import type { Bin } from "../../../types";

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


const PickupRoute = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBins, setSelectedBins] = useState<Bin[]>([]);
  const [routePath, setRoutePath] = useState<Location[]>([]);


  const [startLocation, setStartLocation] = useState<Location | null>(null);


  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/bins")
      .then(res => res.json())
      .then(data => setBins(data.bins || []));
  }, []);


  const searchAddress = async (query: string) => {
    if (query.length < 3) return [];
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
        query
      )}`
    );
    return res.json();
  };


  const detectCurrentLocation = () => {
    setError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setStartLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => setError("Unable to access current location")
    );
  };


  const toggleBin = (bin: Bin) => {
    setSelectedBins(prev =>
      prev.find(b => b.id === bin.id)
        ? prev.filter(b => b.id !== bin.id)
        : [...prev, bin]
    );
  };


  const optimizeRoute = async () => {
    setError(null);

    if (!startLocation) {
      setError("Please select a starting location first.");
      return;
    }

    if (selectedBins.length === 0) {
      setError("Please select at least one bin for pickup.");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/api/route/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: startLocation,
        bins: selectedBins.map(b => ({
          lat: b.lat,
          lng: b.lng
        }))
      })
    });

    const data = await res.json();
    setRoutePath(data.path);
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Pickup Route Planner</h1>


      <h3>Start Location</h3>

      <button onClick={detectCurrentLocation}>
        Use Current Location
      </button>

      <input
        placeholder="Search starting address"
        value={address}
        onChange={async e => {
          const val = e.target.value;
          setAddress(val);

          if (val.length >= 3) {
            const results = await searchAddress(val);
            setSuggestions(results);
          } else {
            setSuggestions([]);
          }
        }}
        style={{ display: "block", marginTop: 10 }}
      />

      {suggestions.length > 0 && (
        <ul
          style={{
            border: "1px solid #ccc",
            maxHeight: 150,
            overflowY: "auto",
            marginTop: 5
          }}
        >
          {suggestions.map(item => (
            <li
              key={item.place_id}
              style={{ padding: 6, cursor: "pointer" }}
              onClick={() => {
                setAddress(item.display_name);
                setStartLocation({
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

      {startLocation && (
        <p>
          Selected Start: {startLocation.lat.toFixed(4)},{" "}
          {startLocation.lng.toFixed(4)}
        </p>
      )}


      <h3 style={{ marginTop: 20 }}>Select Bins</h3>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Fill</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bins.map(bin => (
            <tr key={bin.id}>
              <td>
                <input
                  type="checkbox"
                  checked={!!selectedBins.find(b => b.id === bin.id)}
                  onChange={() => toggleBin(bin)}
                />
              </td>
              <td>{bin.name}</td>
              <td>{bin.fill_level}%</td>
              <td>{bin.status}</td>
            </tr>
          ))}
        </tbody>
      </table>


      <h3 style={{ marginTop: 30 }}>Map View</h3>

      <MapView
        bins={[
          ...bins,
          ...(startLocation
            ? [
                {
                  id: "start",
                  name: "Start Location",
                  lat: startLocation.lat,
                  lng: startLocation.lng,
                  status: "start"
                }
              ]
            : [])
        ]}
        selectedBinIds={selectedBins.map(b => b.id) as string[]}
        onMarkerSelect={toggleBin}
        routePath={routePath}
        center={
          startLocation
            ? [startLocation.lat, startLocation.lng]
            : undefined
        }
      />


      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}


      <button
        style={{ marginTop: 20 }}
        onClick={optimizeRoute}
      >
        Optimize Route
      </button>
    </div>
  );
};

export default PickupRoute;
