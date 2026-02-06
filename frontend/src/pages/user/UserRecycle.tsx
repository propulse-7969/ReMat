import CameraCapture from "../components/CameraCapture";
import Confirmation from "../components/Confirmation";
import { useEffect, useRef, useState } from "react";
import MapView from "../components/MapView";
import type { Bin, DetectionResult } from "../../types";
import QRScanner from "../components/QRScanner";
import { useAuth } from "../../auth/useAuth";
import { extractBinIdFromQR } from "../utils/getBinfromQR";
import SpotlightCard from "../components/SpotlightCard";

interface BinResponse {
  id: string | number;
  name: string;
  lat: string | number;
  lng: string | number;
  status: string;
  fill_level: number;
  capacity: number;
}

// Manual override points from your config
const MANUAL_OVERRIDE_POINTS: Record<string, number> = {
  // 🔋 High environmental risk
  "Battery": 80,
  "Power Bank": 90,
  "UPS": 140,

  // 🧠 High value components
  "PCB": 100,
  "Motherboard": 120,
  "Hard Disk": 70,
  "SSD": 80,
  "RAM": 40,

  // 📱 Personal electronics
  "Mobile": 90,
  "Smartphone": 95,
  "Laptop": 120,
  "Tablet": 80,
  "Smartwatch": 50,

  // 🖥️ Peripherals
  "Mouse": 15,
  "Keyboard": 25,
  "Webcam": 30,
  "Speaker": 40,
  "Earphones": 20,
  "Headphones": 35,

  // 🔌 Accessories & cables
  "Charger": 30,
  "Cable": 10,
  "Adapter": 35,
  "Extension Board": 45,

  // 🎮 Media & entertainment
  "DVD Player": 50,
  "Set Top Box": 60,
  "Game Console": 100,

  // 🖨️ Office electronics
  "Printer": 130,
  "Scanner": 90,
  "Router": 60,
  "Modem": 55,

  // 🍳 Large appliances
  "Microwave": 170,
  "Television": 200,
  "Monitor": 150
};


const UserRecycle = () => {
  const { token } = useAuth();
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [display, setDisplay] = useState<boolean>(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [txnLoading, setTxnLoading] = useState<boolean>(false);
  const [scannedBinId, setScannedBinId] = useState<string | null>(null);
  const [bins, setBins] = useState<Bin[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false);
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState<boolean>(false);

  const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const binsResp = await fetch(`${API_BASE}/api/bins/`);
        if (binsResp.ok) {
          const binsData = await binsResp.json();
            const remoteBins: Bin[] = (binsData.bins ?? []).map((b: BinResponse) => ({
              id: b.id,
              name: b.name,
              lat: Number(b.lat),
              lng: Number(b.lng),
              status: b.status,
              fill_level: b.fill_level,
              capacity: b.capacity,
            }));
          setBins(remoteBins);
          if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng]);
        }
      } catch (error) {
        console.error("Error fetching bins:", error);
      }
    };
  
    fetchBins();
  }, [API_BASE]);

  const handleCapture = async (imageData: string | Blob) => {
    setLoading(true);

    try {
      let imageBlob: Blob;
      if (typeof imageData === "string") {
        const response = await fetch(imageData);
        imageBlob = await response.blob();
      } else {
        imageBlob = imageData;
      }

      const formData = new FormData();
      formData.append("image", imageBlob, "waste-image.jpg");

      const apiResponse = await fetch(`${API_BASE}/user/detect-waste`, {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) throw new Error(`Detection failed: ${apiResponse.status}`);

      const data: DetectionResult = await apiResponse.json();
      setResult(data);
      setDisplay(true);
      setManualMode(false);

      // fetch bins from backend
      const binsResp = await fetch(`${API_BASE}/api/bins/`);
      if (binsResp.ok) {
        const binsData = await binsResp.json();
        const remoteBins: Bin[] = (binsData.bins ?? []).map((b: BinResponse) => ({
          id: b.id,
          name: b.name,
          lat: Number(b.lat),
          lng: Number(b.lng),
          status: b.status,
          fill_level: b.fill_level,
          capacity: b.capacity,
        }));
        setBins(remoteBins);
        if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng]);
      }

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to analyze waste. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSelection = () => {
    setManualMode(true);
    setDisplay(true);
    setResult(null);
    
    // Fetch bins for manual mode too
    fetch(`${API_BASE}/api/bins/`)
      .then(res => res.json())
      .then(binsData => {
        const remoteBins: Bin[] = (binsData.bins ?? []).map((b: BinResponse) => ({
          id: b.id,
          name: b.name,
          lat: Number(b.lat),
          lng: Number(b.lng),
          status: b.status,
          fill_level: b.fill_level,
          capacity: b.capacity,
        }));
        setBins(remoteBins);
        if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng]);
      })
      .catch(console.error);
  };

  const handleManualItemConfirm = () => {
    if (!selectedItem) {
      alert("Please select an item");
      return;
    }
    
    // Create a mock result using manual points
    const mockResult: DetectionResult = {
      waste_type: selectedItem,
      confidence: 1.0,
      base_points: MANUAL_OVERRIDE_POINTS[selectedItem] || 0,
      points_to_earn: MANUAL_OVERRIDE_POINTS[selectedItem] || 0,
      estimated_value: MANUAL_OVERRIDE_POINTS[selectedItem] || 0,
    };
    
    setResult(mockResult);
    setManualMode(false);
  };

  const handleAccept = async () => {
    if (!result || !scannedBinId || !token) return;
    setTxnLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/recycle/${scannedBinId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          waste_type: result.waste_type,
          base_points: result.base_points ?? result.estimated_value ?? 0,
          confidence: result.confidence ?? null,
          user_override: result.confidence === 1.0 && MANUAL_OVERRIDE_POINTS[result.waste_type] !== undefined,
        }),
      });
      if (!res.ok) throw new Error("Transaction failed");
      const data = await res.json();
      alert(`Success! You earned ${data.points_earned} points. 🎉`);
      setDisplay(false);
      setResult(null);
      setScannedBinId(null);
      setSelectedItem("");
      setConfirmationModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Transaction failed. Please try again.");
    } finally {
      setTxnLoading(false);
    }
  };

  const handleReject = () => {
    setScannedBinId(null);
    setConfirmationModalOpen(false);
  };

  const handleChangeSelection = () => {
    setManualMode(true);
    setScannedBinId(null);
    setConfirmationModalOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleCapture(file);
    }
    e.target.value = "";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">♻️</span>
            Recycle E-Waste
          </h1>
          <p className="text-white/60">Scan or select your e-waste item to start earning points</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Camera Scan Card */}
          <SpotlightCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-full">
            <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-blue-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Camera Scan</h3>
              <p className="text-sm text-white/60 mb-4">Use your camera to detect waste</p>
              <button
                onClick={() => setCameraModalOpen(true)}
                className="px-6 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-200 font-semibold rounded-lg transition-all duration-200"
              >
                Open Camera
              </button>
            </div>
          </SpotlightCard>

          {/* Upload Photo Card */}
            <SpotlightCard className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
              <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-purple-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Photo</h3>
              <p className="text-sm text-white/60 mb-4">Choose from your gallery</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-6 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse Files
              </button>
            </div>
          </SpotlightCard>

          {/* Manual Selection Card */}
            <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 h-full">
              <div className="flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-green-500/20 rounded-xl mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manual Select</h3>
              <p className="text-sm text-white/60 mb-4">Choose item from list</p>
              <button
                type="button"
                onClick={handleManualSelection}
                disabled={loading}
                className="px-6 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Item
              </button>
            </div>
          </SpotlightCard>
        </div>

        {/* Camera Modal */}
        {cameraModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setCameraModalOpen(false)} />
            <div className="relative w-full max-w-2xl mx-4">
              <div className="bg-transparent p-4 rounded-lg">
                <CameraCapture
                  onCapture={(img) => { handleCapture(img); setCameraModalOpen(false); }}
                  onError={(e) => alert(e)}
                  facingMode="environment"
                  autoStop={true}
                  autoOpen={true}
                  onClose={() => setCameraModalOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {qrScannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
              onClick={() => setQrScannerModalOpen(false)} 
            />
            <div className="relative w-full max-w-3xl">
              <SpotlightCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Scan Bin QR Code
                  </h3>
                  <button
                    onClick={() => setQrScannerModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <QRScanner
                  onScanSuccess={(decodedText) => {
                    const binId = extractBinIdFromQR(decodedText) ?? decodedText.trim();
                    if (!binId) {
                      alert("Invalid QR Code. Please try again.");
                      return;
                    }
                    setScannedBinId(binId);
                    setQrScannerModalOpen(false);
                    setConfirmationModalOpen(true);
                  }}
                />
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModalOpen && scannedBinId && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmationModalOpen(false)} />
            <div className="relative w-full max-w-2xl">
              <SpotlightCard className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 rounded-xl p-8">
                <Confirmation
                  result={result}
                  binId={scannedBinId}
                  binName={bins.find((b) => String(b.id) === scannedBinId)?.name}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  loading={txnLoading}
                />
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin mb-4"></div>
              <p className="text-white font-medium text-lg">Analyzing waste...</p>
              <p className="text-white/50 text-sm mt-2">This may take a few seconds</p>
            </div>
          </SpotlightCard>
        )}

        {/* Manual Mode Selection */}
        {display && manualMode && (
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 mb-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select Your Item
              </h2>
              <p className="text-white/60 mb-6">Choose the e-waste item you're recycling from the list below:</p>
              
              <select 
                value={selectedItem} 
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-base mb-6 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              >
                <option value="" className="bg-gray-900">-- Choose an item --</option>
                {Object.entries(MANUAL_OVERRIDE_POINTS)
                  .sort((a, b) => b[1] - a[1])
                  .map(([item, points]) => (
                    <option key={item} value={item} className="bg-gray-900">
                      {item} - {points} points
                    </option>
                  ))}
              </select>

              <div className="flex gap-4">
                <button 
                  onClick={handleManualItemConfirm}
                  disabled={!selectedItem}
                  className="flex-1 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500"
                >
                  Confirm Selection
                </button>
                <button 
                  onClick={() => { 
                    setManualMode(false); 
                    setDisplay(false); 
                    setSelectedItem(""); 
                  }}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </SpotlightCard>
        )}

        {/* Detection Result */}
        {display && !manualMode && result && (
          <div className="space-y-6 mb-8">
            <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detection Result
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-300/70 uppercase tracking-wide font-medium mb-2">Waste Type</p>
                  <p className="text-2xl font-bold text-white">{result.waste_type}</p>
                </div>
                
                <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <p className="text-sm text-purple-300/70 uppercase tracking-wide font-medium mb-2">Confidence</p>
                  <p className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-sm text-green-300/70 uppercase tracking-wide font-medium mb-2">Points to Earn</p>
                  <p className="text-2xl font-bold text-green-400">{result.points_to_earn ?? result.estimated_value ?? 0}</p>
                </div>
              </div>

              {result.confidence < 0.40 && (
                <div className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex gap-4">
                    <svg className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-300 mb-1">Low Confidence Detection</p>
                      <p className="text-sm text-yellow-200/80 mb-3">The AI is not very confident about this detection. Consider using manual selection for better accuracy.</p>
                      <button 
                        onClick={handleChangeSelection} 
                        className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 font-semibold rounded-lg transition-all duration-200 text-sm"
                      >
                        Change Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Scanner Button */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scan Bin QR Code
                </h3>
                <p className="text-white/60 text-sm mb-4">Point your camera at the QR code on the e-waste bin</p>
                
                <button
                  type="button"
                  onClick={() => setQrScannerModalOpen(true)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scan QR Code
                </button>
              </div>
            </SpotlightCard>
          </div>
        )}

        {/* Map Section */}
        {bins.length > 0 && (
          <SpotlightCard className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Nearby E-Waste Bins
              </h2>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">{bins.filter(b => b.status === 'active').length} Active</span>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '450px' }}>
              <MapView
                bins={bins}
                center={userLocation ? [userLocation.lat, userLocation.lng] : mapCenter}
                zoom={13}
                height="100%"
                userLocation={userLocation ?? undefined}
              />
            </div>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
};

export default UserRecycle;