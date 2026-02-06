import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./BinScreen.css";
import type { Bin } from "../../types";

const BinScreen = () => {
  const { binId } = useParams();
  const [bin, setBin] = useState<Bin>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/bins/${binId}`)
      .then(res => res.json())
      .then(data => {
        setBin(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch bin:", err);
        setLoading(false);
      });
  }, [binId]);

  if (loading) {
    return (
      <div className="bin-fullscreen">
        <div className="bin-screen-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!bin) {
    return (
      <div className="bin-fullscreen">
        <div className="bin-screen-content">
          <div className="error-icon">⚠️</div>
          <p className="error-text">Bin not found</p>
        </div>
      </div>
    );
  }

  const fillPercent = Math.round(
    ((bin.fill_level ?? 0) / (bin.capacity ?? 1)) * 100
  );

  return (
    <div className="bin-fullscreen">
      <div className="bin-screen-content">
        {/* Left Side - Bin Information */}
        <div className="info-section">
          <div className="info-block">
            <p className="info-label">Bin Name</p>
            <h1 className="info-title">{bin.name}</h1>
          </div>

          <div className="info-block">
            <p className="info-label">Bin ID</p>
            <p className="info-id">#{bin.id}</p>
          </div>

          <div className="info-block">
            <p className="info-label">Fill %</p>
            <p className="info-fill">{fillPercent}%</p>
          </div>
        </div>

        {/* Right Side - QR Code */}
        <div className="qr-section">
          <div className="qr-code-wrapper">
            <QRCode
              value={`${bin.id}`}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
          <p className="qr-label">Scan to Recycle!</p>
        </div>
      </div>
    </div>
  );
};

export default BinScreen;