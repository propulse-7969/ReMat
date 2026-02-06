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
  if (isSelected) color = "blue";
  if (status === "start") color = "orange";

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

const userLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  bins?: Bin[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (bin: Bin) => void;
  onMapClick?: (coords: MapCoords) => void;
  showPopup?: boolean;
  userLocation?: { lat: number; lng: number };
  selectedBinIds?: string[];
  onMarkerSelect?: (bin: Bin) => void;
  routePath?: { lat: number; lng: number }[];
}

export default function MapView({ 
  bins = [], 
  center = [25.26, 82.98], 
  zoom = 13, 
  height = "400px", 
  onMarkerClick, 
  onMarkerSelect, 
  onMapClick, 
  routePath, 
  selectedBinIds, 
  showPopup = true, 
  userLocation 
}: MapViewProps) {
  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          padding: 0;
          overflow: hidden;
        }
        
        .leaflet-popup-content {
          margin: 0;
          padding: 16px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
        }
        
        .popup-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .popup-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .popup-info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        
        .popup-label {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }
        
        .popup-value {
          color: #fff;
          font-weight: 600;
        }
        
        .popup-status-active {
          color: #4ade80;
        }
        
        .popup-status-maintenance {
          color: #fbbf24;
        }
        
        .popup-status-full {
          color: #f87171;
        }
        
        .popup-button {
          width: 100%;
          padding: 10px 16px;
          background: linear-gradient(to right, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .popup-button:hover {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .popup-button svg {
          width: 16px;
          height: 16px;
        }

        .leaflet-container {
          background: #0f172a;
        }
      `}</style>
      
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

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="popup-title">📍 Your Location</div>
            </Popup>
          </Marker>
        )}

        {bins.map((bin) => {
          const selected = selectedBinIds?.includes(bin.id.toString()) ?? false;
          const statusClass = 
            bin.status === 'active' ? 'popup-status-active' :
            bin.status === 'maintenance' ? 'popup-status-maintenance' :
            bin.status === 'full' ? 'popup-status-full' : '';
          
          return (
            <Marker
              key={bin.id}
              position={[bin.lat, bin.lng]}
              icon={getMarkerIcon(bin.status, bin.fill_level, selected)}
              eventHandlers={{
                click: () => {
                  if (bin.status === "start") return;
                  if (onMarkerSelect) onMarkerSelect(bin);
                  if (onMarkerClick) onMarkerClick(bin);
                },
              }}
            >
              {showPopup && (
                <Popup>
                  <div className="popup-title">{bin.name || "E-Waste Bin"}</div>
                  <div className="popup-info">
                    <div className="popup-info-item">
                      <span className="popup-label">Status</span>
                      <span className={`popup-value ${statusClass}`}>
                        {bin.status || "N/A"}
                      </span>
                    </div>
                    <div className="popup-info-item">
                      <span className="popup-label">Fill Level</span>
                      <span className="popup-value">{bin.fill_level ?? "N/A"}%</span>
                    </div>
                    {bin.capacity && (
                      <div className="popup-info-item">
                        <span className="popup-label">Capacity</span>
                        <span className="popup-value">{bin.capacity}L</span>
                      </div>
                    )}
                  </div>
                  {bin.status === 'active' && (
                    <button 
                      className="popup-button"
                      onClick={() => {
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${bin.lat},${bin.lng}`;
                        window.open(mapsUrl, "_blank");
                      }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Get Directions
                    </button>
                  )}
                </Popup>
              )}
            </Marker>
          );
        })}

        {routePath && routePath.length > 1 && (
          <Polyline
            positions={routePath.map(p => [p.lat, p.lng])}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </>
  );
}