import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./BinScreen.css";
import type { Bin } from "../../types";
import { useRef } from "react";

const BinScreen = () => {
  const qrRef = useRef<HTMLDivElement>(null);

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

  // const downloadSVG = () => {
  //   if (!qrRef.current) return;

  //   const svg = qrRef.current.querySelector("svg");
  //   if (!svg) return;

  //   const serializer = new XMLSerializer();
  //   const source = serializer.serializeToString(svg);

  //   const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  //   const url = URL.createObjectURL(blob);

  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `bin-${bin.id}-qr.svg`;
  //   link.click();

  //   URL.revokeObjectURL(url);
  // };

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
          <div ref={qrRef}>
            <QRCode
              value={`${bin.id}`}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* <button onClick={downloadSVG}>
            ⬇ Download QR (SVG)
          </button> */}
        </section>

        <footer className="bin-footer">
          Status: <span className="status">{bin.status}</span>
        </footer>
      </div>
    </div>
  );
};

export default BinScreen;
