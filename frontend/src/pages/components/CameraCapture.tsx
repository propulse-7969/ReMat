import { useEffect, useRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (image: Blob) => void;
  onError?: (error: string) => void;
  facingMode?: "user" | "environment";
  autoStop?: boolean;
};

export default function CameraCapture({
  onCapture,
  onError,
  facingMode = "environment",
  autoStop = true
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      onError?.("Camera access denied");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (blob) {
        onCapture(blob);
        if (autoStop) stopCamera();
      }
    }, "image/jpeg");
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} hidden />
      <button onClick={capture}>Capture</button>
    </div>
  );
}
