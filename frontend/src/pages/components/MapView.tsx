import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Bin } from "../../types";
import { Polyline } from "react-leaflet";


export interface MapCoords {
  lat: number;
  lng: number;
}

interface MapClickHandlerProps {
  onMapClick?: (coords: MapCoords) => void;
}


const getMarkerIcon = (status?: string, fillLevel?: number, isSelected?: boolean) => {
  let color = "green";
  
  if (status === "maintenance") color = "grey";
  if (fillLevel !== undefined && fillLevel >= 90 || status === "full") color = "red";
  if (isSelected) color = "blue"
  if (status === "start") color = "orange"

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};



const MapClickHandler = ({ onMapClick }: MapClickHandlerProps) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      }
    },
  });
  return null;
};


interface MapViewProps {
  bins?: Bin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (bin: Bin) => void;
  onMapClick?: (coords: MapCoords) => void;
  showPopup?: boolean;

  selectedBinIds?: string[];
  onMarkerSelect?: (bin: Bin) => void;
  routePath?: { lat: number; lng: number }[];
}

export default function MapView({ bins = [], center = [25.26, 82.98], zoom = 13, height = "400px", onMarkerClick, 
  onMarkerSelect, onMapClick, routePath, selectedBinIds, showPopup = true}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {bins.map((bin) => {
        const selected = selectedBinIds?.includes(bin.id.toString()) ?? false;
        return (
          <Marker
          key={bin.id}
          position={[bin.lat, bin.lng]}
          icon={getMarkerIcon(bin.status, bin.fill_level, selected)}
          eventHandlers={{
            click: () => {
              if (bin.status === "start") return;
              if (onMarkerSelect) onMarkerSelect(bin)
              if (onMarkerClick) onMarkerClick(bin);
            },
          }}
        >
          {showPopup && (
            <Popup>
              <strong>{bin.name || "Bin"}</strong>
              <br />
              Status: {bin.status || "N/A"}
              <br />
              Fill Level: {bin.fill_level ?? "N/A"}%
              <br />
              {bin.status == 'active' && 
              <button onClick={() => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${bin.lat},${bin.lng}`;
                window.open(mapsUrl, "_blank");
                }}>
                Get Directions!</button>}
            </Popup>
          )}
        </Marker>
        )
      })}

      {routePath && routePath.length > 1 && (
        <Polyline
          positions={routePath.map(p => [p.lat, p.lng])}
        />
      )}
    </MapContainer>
  );
}