import CameraCapture from "../components/CameraCapture"
import Confirmation from "../components/Confirmation"
import { useEffect, useRef, useState } from "react"
import MapView from "../components/MapView"
import type { Bin, DetectionResult } from "../../types"
import QRScanner from "../components/QRScanner"
import { useAuth } from "../../auth/useAuth"
import { extractBinIdFromQR } from "../utils/getBinfromQR"

// Manual override points from your config
const MANUAL_OVERRIDE_POINTS: Record<string, number> = {
  "PCB": 90,
  "Battery": 60,
  "Mobile": 80,
  "Player": 50,
  "Mouse": 15,
  "Keyboard": 20,
  "Printer": 120,
  "Microwave": 150,
  "Television": 180,
  "Laptop": 100,
  "Other": 50
}

const UserRecycle = () => {
  const { token } = useAuth()
  const [display, setDisplay] = useState<boolean>(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [txnLoading, setTxnLoading] = useState<boolean>(false)
  const [scannedBinId, setScannedBinId] = useState<string | null>(null)
  const [bins, setBins] = useState<Bin[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [manualMode, setManualMode] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<string>("")

  const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000"

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [])

  const handleCapture = async (imageData: string | Blob) => {
    setLoading(true)

    try {
      let imageBlob: Blob
      if (typeof imageData === "string") {
        const response = await fetch(imageData)
        imageBlob = await response.blob()
      } else {
        imageBlob = imageData
      }

      const formData = new FormData()
      formData.append("image", imageBlob, "waste-image.jpg")

      const apiResponse = await fetch(`${API_BASE}/user/detect-waste`, {
        method: "POST",
        body: formData,
      })

      if (!apiResponse.ok) throw new Error(`Detection failed: ${apiResponse.status}`)

      const data: DetectionResult = await apiResponse.json()
      setResult(data)
      setDisplay(true)
      setManualMode(false) // Reset manual mode when new detection is made

      // fetch bins from backend
      const binsResp = await fetch(`${API_BASE}/api/bins/`)
      if (binsResp.ok) {
        const binsData = await binsResp.json()
        const remoteBins: Bin[] = (binsData.bins ?? []).map((b: any) => ({
          id: b.id,
          name: b.name,
          lat: Number(b.lat),
          lng: Number(b.lng),
          status: b.status,
          fill_level: b.fill_level,
          capacity: b.capacity,
        }))
        setBins(remoteBins)
        if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng])
      }

    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSelection = () => {
    setManualMode(true)
    setDisplay(true)
    setResult(null)
    
    // Fetch bins for manual mode too
    fetch(`${API_BASE}/api/bins/`)
      .then(res => res.json())
      .then(binsData => {
        const remoteBins: Bin[] = (binsData.bins ?? []).map((b: any) => ({
          id: b.id,
          name: b.name,
          lat: Number(b.lat),
          lng: Number(b.lng),
          status: b.status,
          fill_level: b.fill_level,
          capacity: b.capacity,
        }))
        setBins(remoteBins)
        if (remoteBins.length > 0) setMapCenter([remoteBins[0].lat, remoteBins[0].lng])
      })
      .catch(console.error)
  }

  const handleManualItemConfirm = () => {
    if (!selectedItem) {
      alert("Please select an item")
      return
    }
    
    // Create a mock result using manual points
    const mockResult: DetectionResult = {
      waste_type: selectedItem,
      confidence: 1.0, // Manual selection = 100% confidence
      base_points: MANUAL_OVERRIDE_POINTS[selectedItem] || 0,
      points_to_earn: MANUAL_OVERRIDE_POINTS[selectedItem] || 0,
      estimated_value: MANUAL_OVERRIDE_POINTS[selectedItem] || 0,
    }
    
    setResult(mockResult)
    setManualMode(false)
  }

  const handleAccept = async () => {
    if (!result || !scannedBinId || !token) return
    setTxnLoading(true)
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
      })
      if (!res.ok) throw new Error("Transaction failed")
      const data = await res.json()
      alert(`Success! You earned ${data.points_earned} points.`)
      setDisplay(false)
      setResult(null)
      setScannedBinId(null)
      setSelectedItem("")
    } catch (err) {
      console.error(err)
      alert("Transaction failed. Please try again.")
    } finally {
      setTxnLoading(false)
    }
  }

  const handleReject = () => {
    setScannedBinId(null)
  }

  const handleChangeSelection = () => {
    setManualMode(true)
    setScannedBinId(null)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleCapture(file)
    }
    e.target.value = ""
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <CameraCapture onCapture={handleCapture} facingMode="environment" />
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 8 }}>or</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Upload Photo
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 8 }}>or</span>
          <button
            type="button"
            onClick={handleManualSelection}
            disabled={loading}
          >
            Select Manually
          </button>
        </div>
      </div>

      {loading && <p>Analyzing waste...</p>}

      {display && manualMode && (
        <div style={{ marginBottom: 20, padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
          <h2>Manual Item Selection</h2>
          <p>Select the item you're recycling:</p>
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12, fontSize: 16 }}
          >
            <option value="">-- Choose an item --</option>
            {Object.keys(MANUAL_OVERRIDE_POINTS).map(item => (
              <option key={item} value={item}>
                {item} ({MANUAL_OVERRIDE_POINTS[item]} points)
              </option>
            ))}
          </select>
          <button 
            onClick={handleManualItemConfirm}
            disabled={!selectedItem}
            style={{ marginRight: 8 }}
          >
            Confirm Selection
          </button>
          <button onClick={() => { setManualMode(false); setDisplay(false); setSelectedItem(""); }}>
            Cancel
          </button>
        </div>
      )}

      {display && !manualMode && result && (
        <div>
          <h1>Detection Result</h1>
          <p>Waste Type: {result.waste_type}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          <p>Points to Earn: {result.points_to_earn ?? result.estimated_value ?? 0}</p>
          
          {result.confidence < 0.40 && (
            <div style={{ backgroundColor: "#fff3cd", padding: 12, marginBottom: 12, borderRadius: 4 }}>
              <strong>Low confidence detection.</strong> Consider using manual selection instead.
              <button 
                onClick={handleChangeSelection} 
                style={{ marginLeft: 12 }}
              >
                Change Selection
              </button>
            </div>
          )}
          
          <h3>Scan QR at bin</h3>
          <QRScanner
            onScanSuccess={(decodedText) => {
              const binId = extractBinIdFromQR(decodedText) ?? decodedText.trim()
              if (!binId) {
                alert("Invalid QR Code")
                return
              }
              setScannedBinId(binId)
            }}
          />
          {scannedBinId && (
            <Confirmation
              result={result}
              binId={scannedBinId}
              binName={bins.find((b) => String(b.id) === scannedBinId)?.name}
              onAccept={handleAccept}
              onReject={handleReject}
              loading={txnLoading}
            />
          )}
        </div>
      )}

      {bins.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2>Nearby Bins</h2>
          <MapView
            bins={bins}
            center={userLocation ? [userLocation.lat, userLocation.lng] : mapCenter}
            zoom={13}
            height="400px"
            userLocation={userLocation ?? undefined}
          />
        </div>
      )}

    </div>
  )
}

export default UserRecycle