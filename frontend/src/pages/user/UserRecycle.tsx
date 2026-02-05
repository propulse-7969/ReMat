import CameraCapture from "../components/CameraCapture"
import { useState } from "react"
import MapView from "../components/MapView"
import type { Bin, DetectionResult } from "../../types"
import QRScanner from "../components/QRScanner"
import { useNavigate } from "react-router-dom"
import { extractBinIdFromQR } from "../utils/getBinfromQR"

const UserRecycle = () => {
  const [display, setDisplay] = useState<boolean>(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [bins, setBins] = useState<Bin[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const navigate=useNavigate();

  const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000"

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

  const qrclickHander = () =>{

  }

  return (
    <div>
      <CameraCapture onCapture={handleCapture} facingMode="environment" />

      {loading && <p>Analyzing waste...</p>}

      {display && result && (
        <div>
          <h1>Detection Result</h1>
          <p>Waste Type: {result.waste_type}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          <p>Estimated Value: {result.estimated_value}</p>
          <button onClick={qrclickHander}>SCAN QR CODE NIGGA!</button>
          <QRScanner
            onScanSuccess={(decodedText) => {
              const binId = extractBinIdFromQR(decodedText);

              if (!binId) {
                alert("Invalid QR Code");
                return;
              }

              navigate(`/user/recycle/${binId}`);
            }}
          />


        </div>
      )}

      {bins.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h2>Nearby Bins</h2>
          <MapView bins={bins} center={mapCenter} zoom={13} height="400px" />
        </div>
      )}

    </div>
  )
}

export default UserRecycle