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
    return <div className="bin-loading">Loading bin…</div>;
  }

  if (!bin) {
    return <div className="bin-error">Bin not found 🚫</div>;
  }

  const fillPercent = Math.round(
    ((bin.fill_level ?? 0) / (bin.capacity ?? 1)) * 100
  );

  return (
    <div className="bin-wrapper">
      <div className="bin-tablet">
        <header className="bin-header">
          <h1>REMAT BIN</h1>
          <span className="bin-id">#{bin.id}</span>
        </header>

        <section className="bin-location">
            <button
                className="map-button"
                onClick={() => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${bin.lat},${bin.lng}`;
                window.open(mapsUrl, "_blank");
                }}
            >
                📍 Show on Map
            </button>
        </section>

        <section className="bin-fill">
          <p>Fill Level</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <span>{fillPercent}% full</span>
        </section>

        {/* <section className="bin-items">
          <p>Accepted Items</p>
          <ul>
            {bin.accepted_items.map(item => (
              <li key={item}>♻ {item}</li>
            ))}
          </ul>
        </section> */}

        <section className="bin-qr">
          <QRCode
            value={`http://localhost:5173/user/recycle/${bin.id}`}
            size={160}
            bgColor="#020617"
            fgColor="#ffffff"
          />
          <p>Scan to Donate</p>
        </section>

        <footer className="bin-footer">
          Status: <span className="status">{bin.status}</span>
        </footer>
      </div>
    </div>
  );
};

export default BinScreen;
