import { useEffect, useRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (image: Blob) => void;
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
  autoStop = true
  , autoOpen = false,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

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

  // Do not auto-start camera. Camera will start when user requests it.
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // If parent requests auto open (used for modal), start camera on mount
  useEffect(() => {
    if (autoOpen) {
      setShowCamera(true);
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsCapturing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (blob) {
        onCapture(blob);
        if (autoStop) stopCamera();
        onClose?.();
      }
      setIsCapturing(false);
    }, "image/jpeg");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        {/* Camera Container */}
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
              {/* Capture Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-white/30 rounded-2xl"></div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-6 space-y-4">
          {/* Status Text */}
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">
              {!showCamera ? "Open camera to capture" : stream ? "Ready to capture" : "Initializing camera..."}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!showCamera) {
                  setShowCamera(true);
                  startCamera();
                  return;
                }
                capture();
              }}
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

          {/* Info Text */}
          <p className="text-white/40 text-xs text-center">
            Position your e-waste item in the frame for AI detection
          </p>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
