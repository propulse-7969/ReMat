import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

type Props = {
  onScanSuccess: (text: string) => void;
  onClose?: () => void;
};

export default function QRScanner({ onScanSuccess, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);


  const startScan = async () => {
    if (!videoRef.current || isScanning) return;

    setError(null);
    const scanner = new QrScanner(
      videoRef.current,
      (result) => {

        try {
          stopScan();
        } 
        catch (e) {
          console.log("An error occurred: ", e);
        }
        setScanned(true);
        onScanSuccess(result.data);
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true
      }
    );

    try {
      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
    } 
    catch (err) {
      console.error("Camera start failed", err);
      setError("Camera access denied");
      setIsScanning(false);
    }
  };


  const stopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };


  useEffect(() => {
    startScan();
    return () => stopScan();
  }, []);

  
  if (scanned) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Video Preview Container */}
        <div className="relative bg-black aspect-video overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
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
                onClick={() => {
                  stopScan();
                  onClose?.();
                }}
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
  );
}