import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

type Props = {
  onScanSuccess: (text: string) => void;
};

export default function QRScanner({ onScanSuccess }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // --- START CAMERA SCAN (user controlled) ---
  const startScan = async () => {
    if (!videoRef.current || isScanning) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScanSuccess(result.data);
        stopScan();
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true
      }
    );

    scannerRef.current = scanner;
    setIsScanning(true);

    try {
      await scanner.start();
    } catch (err) {
      console.error("Camera start failed", err);
      setIsScanning(false);
    }
  };

  // --- STOP CAMERA SCAN ---
  const stopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // --- FILE UPLOAD SCAN ---
  const scanFromFile = async (file: File) => {
    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true
      });
      onScanSuccess(result.data);
    } catch (err) {
      console.error("QR scan failed", err);
      alert("No QR code found in image");
    }
  };

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    <div>
      {/* Video preview (hidden until scanning) */}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxWidth: 320,
          display: isScanning ? "block" : "none"
        }}
      />

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
