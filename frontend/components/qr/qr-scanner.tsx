"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Zap } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (data: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")

  const requestRef = useRef<number>()

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(e => console.error("Error playing video:", e));

          setIsActive(true)
          setError(null)
          requestRef.current = requestAnimationFrame(scanTick);
        }
      } catch (err) {
        setError("Camera access denied or not available")
        console.error("Camera error:", err)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
  }, [cameraFacing])

  const scanTick = () => {
    if (videoRef.current && canvasRef.current && !isProcessing) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleFoundQRCode(code.data);
        }
      }
    }
    requestRef.current = requestAnimationFrame(scanTick);
  };

  const handleFoundQRCode = (data: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    //console.log("QR Code found from camera:", data);
    onScan(data);
    setScanCount(prev => prev + 1);
    setLastScanTime(new Date());

    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("File selected:", file.name, file.type, file.size)
    setIsProcessing(true)
    setError(null) // Clear previous errors

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      const img = new Image();
      img.onload = () => {
        console.log("Image loaded:", img.width, "x", img.height)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setError("Failed to create canvas context");
          setIsProcessing(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            console.log("QR Code found from file:", code.data)
            onScan(code.data);
            setScanCount(prev => prev + 1);
            setLastScanTime(new Date());
          } else {
            console.warn("No QR code found in image")
            setError("Could not detect a QR code in this image. Please ensure good lighting and clear quality.");
          }
        } catch (err) {
          console.error("QR Decoding error:", err)
          setError("Error decoding QR code from image");
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = (err) => {
        console.error("Image load error:", err);
        setError("Failed to load image file");
        setIsProcessing(false);
      }
      img.src = e.target.result as string;
    };
    reader.onerror = (err) => {
      console.error("File read error:", err);
      setError("Failed to read file");
      setIsProcessing(false);
    }
    reader.readAsDataURL(file);
  }

  const flipCamera = () => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      <div className="relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover rounded-lg bg-muted" />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Processing...</p>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={flipCamera}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">Position QR code within the frame or upload image</p>

        <div className="flex justify-center space-x-2">
          <label htmlFor="qr-upload-main">
            <Button variant="outline" className="bg-transparent cursor-pointer" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </span>
            </Button>
          </label>
          <input id="qr-upload-main" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>

        {scanCount > 0 && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Scans completed: {scanCount}</p>
            {lastScanTime && <p>Last scan: {lastScanTime.toLocaleTimeString()}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
