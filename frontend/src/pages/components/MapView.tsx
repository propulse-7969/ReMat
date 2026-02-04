import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Bin } from "../../types";


export interface MapCoords {
  lat: number;
  lng: number;
}

interface MapClickHandlerProps {
  onMapClick?: (coords: MapCoords) => void;
}


const getMarkerIcon = (status?: string, fillLevel?: number) => {
  let color = "green";

  if (status === "maintenance") color = "grey";

  if (fillLevel !== undefined && fillLevel >= 90) color = "red";

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
}

export default function MapView({ bins = [], center = [25.26, 82.98], zoom = 13, height = "400px", onMarkerClick, onMapClick, showPopup = true}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {bins.map((bin) => (
        <Marker
          key={bin.id}
          position={[bin.lat, bin.lng]}
          icon={getMarkerIcon(bin.status, bin.fill_level)}
          eventHandlers={{
            click: () => {
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
              {bin.status == 'active' && <button>Get Directions!</button>} {/*TODO --> Add location fetching logic and user can then change the starting location and implement inbuild diktra*/}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}