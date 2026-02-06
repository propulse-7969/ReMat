import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

type Props = {
  onScanSuccess: (text: string) => void;
};

export default function QRScanner({ onScanSuccess }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanned, setScanned] = useState(false);

  // --- START CAMERA SCAN (user controlled) ---
  const startScan = async () => {
    if (!videoRef.current || isScanning) return;

    setError(null);
    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        // stop scanner and mark scanned before notifying parent so UI hides quickly
        try {
          stopScan();
        } catch (e) {}
        setScanned(true);
        onScanSuccess(result.data);
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
      setError("Camera access denied");
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
      setError(null);
      setIsProcessing(true);
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true
      });
      onScanSuccess(result.data);
    } catch (err) {
      console.error("QR scan failed", err);
      setError("No QR code found in image");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    // hide scanner UI after a successful scan
    scanned ? null : (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Video Preview Container */}
        <div className="relative bg-black aspect-video overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            className={isScanning ? "w-full h-full object-cover" : "hidden"}
            autoPlay
            playsInline
            muted
          />
          {/* Scan Frame Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-purple-400/50 rounded-2xl"></div>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="px-6 py-6 space-y-4">
          {error ? (
            <div className="text-center px-4 py-8">
              <svg className="w-16 h-16 text-red-400/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white font-semibold mb-2">Scan Failed</p>
              <p className="text-white/60 text-sm">{error}</p>
              {error === "Camera access denied" && (
                <button
                  onClick={() => {
                    setError(null);
                    startScan();
                  }}
                  className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : !isScanning ? (
            <>
              <div className="text-center mb-2">
                <svg className="w-16 h-16 text-purple-400/60 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-white/60 text-sm font-medium">
                  Scan a QR code to get bin details
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={startScan}
                  className="w-full py-3 px-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/20 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Start Camera Scan
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  {/* <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/5 text-white/50">or</span>
                  </div> */}
                </div>

                <label className="block cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) scanFromFile(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload QR Image
                  </div>
                </label>
              </div>

              <p className="text-white/40 text-xs text-center">
                Position the QR code in the frame or upload an image
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-4">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">Scanning...</span>
                </div>
                <p className="text-white/60 text-sm">
                  Position the QR code in the frame
                </p>
              </div>

              <button
                onClick={stopScan}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Scanning
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    )
  );
}
