import { Html5Qrcode } from "html5-qrcode";
import { useRef, useState } from "react";

type Props = {
  onScanSuccess: (text: string) => void;
};

export default function QRScanner({ onScanSuccess }: Props) {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = async () => {
    if (isScanning) return;

    qrRef.current = new Html5Qrcode("qr-reader");
    setIsScanning(true);

    try {
      await qrRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScan();
        },
        () => {}
      );
    } catch (err) {
      console.error("Failed to start scanner", err);
      setIsScanning(false);
    }
  };

  const stopScan = async () => {
    if (!qrRef.current) return;

    try {
      if (qrRef.current.isScanning) {
        await qrRef.current.stop();
      }
      await qrRef.current.clear();
    } catch {}
    finally {
      qrRef.current = null;
      setIsScanning(false);
    }
  };

  const scanFromFile = async (file: File) => {
    // Clean up any existing instance first
    if (qrRef.current) {
      try {
        if (qrRef.current.isScanning) {
          await qrRef.current.stop();
        }
        await qrRef.current.clear();
      } catch {}
    }

    const html5QrCode = new Html5Qrcode("qr-reader");

    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error("QR scan error:", err);
      alert("No QR code found in image");
    } finally {
      try {
        await html5QrCode.clear();
      } catch {}
    }
  };

  return (
    <div>
      <div id="qr-reader" />

      {!isScanning ? (
        <>
          <button onClick={startScan}>Scan QR</button>

          <label style={{ display: "block", marginTop: 12 }}>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) scanFromFile(file);
                e.target.value = ""; 
              }}
            />
            <span style={{ cursor: "pointer", color: "blue" }}>
              Upload QR Image
            </span>
          </label>
        </>
      ) : (
        <button onClick={stopScan}>Stop</button>
      )}
    </div>
  );
}