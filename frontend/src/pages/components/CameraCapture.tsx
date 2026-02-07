import { useEffect, useRef, useState } from "react";
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

type CameraCaptureProps = {
  onCapture: (image: string) => void; // Now always returns base64 string
  onError?: (error: string) => void;
  facingMode?: "user" | "environment";
  autoStop?: boolean;
  autoOpen?: boolean;
  onClose?: () => void;
};

export default function CameraCapture({
  onCapture,
  onError,
  facingMode = "environment",
  autoStop = true,
  autoOpen = false,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const isNative = Capacitor.isNativePlatform();

  // Native camera capture using Capacitor
  const captureWithNativeCamera = async () => {
    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        // Return the base64 data URL directly
        onCapture(image.dataUrl);
        onClose?.();
      }
    } catch (err: any) {
      const errorMsg = err.message || "Camera access denied";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsCapturing(false);
    }
  };

  // Web camera functions
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMsg = "Camera access denied";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const captureWeb = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsCapturing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    // Convert canvas to base64 data URL
    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    
    onCapture(base64Image);
    if (autoStop) stopCamera();
    onClose?.();
    setIsCapturing(false);
  };

  // Cleanup
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Auto-open for web only
  useEffect(() => {
    if (autoOpen && !isNative) {
      setShowCamera(true);
      startCamera();
    }
  }, [autoOpen]);

  // Handle capture button click
  const handleCapture = () => {
    if (isNative) {
      // Use native camera directly
      captureWithNativeCamera();
    } else {
      // Use web camera
      if (!showCamera) {
        setShowCamera(true);
        startCamera();
      } else {
        captureWeb();
      }
    }
  };

  // For native, show simplified UI
  if (isNative) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
          <div className="relative bg-black aspect-video overflow-hidden flex items-center justify-center">
            <div className="text-center px-4 py-12">
              <svg className="w-16 h-16 text-blue-300/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white font-semibold mb-2">Open Camera</p>
              <p className="text-white/60 text-sm">Tap to open your camera and capture an image</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="text-center">
              <p className="text-white/60 text-sm font-medium">
                Ready to capture
              </p>
            </div>

            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-full py-3 px-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-white/10 disabled:to-white/10 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isCapturing ? "Capturing..." : "Open Camera"}
            </button>

            <p className="text-white/40 text-xs text-center">
              Position your e-waste item in the frame for AI detection
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Web camera UI
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <div className="relative bg-black aspect-video overflow-hidden flex items-center justify-center">
          {!showCamera ? (
            <div className="text-center px-4 py-12">
              <svg className="w-16 h-16 text-blue-300/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white font-semibold mb-2">Open Camera</p>
              <p className="text-white/60 text-sm">Tap to open your camera and capture an image</p>
            </div>
          ) : error ? (
            <div className="text-center px-4 py-12">
              <svg className="w-16 h-16 text-red-400/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 0v2M9 5h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
              <p className="text-white font-semibold mb-2">Camera Access Denied</p>
              <p className="text-white/60 text-sm">{error}</p>
              <button
                onClick={() => startCamera()}
                className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/30 rounded-2xl"></div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">
              {!showCamera ? "Open camera to capture" : stream ? "Ready to capture" : "Initializing camera..."}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCapture}
              disabled={isCapturing || (showCamera && !stream)}
              className="flex-1 py-3 px-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-white/10 disabled:to-white/10 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!showCamera ? "Open Camera" : isCapturing ? "Capturing..." : "Capture Photo"}
            </button>
            {showCamera && (
              <button
                onClick={() => {
                  stopCamera();
                  setShowCamera(false);
                  setError(null);
                  onClose?.();
                }}
                className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <p className="text-white/40 text-xs text-center">
            Position your e-waste item in the frame for AI detection
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} hidden />
    </div>
  );
}