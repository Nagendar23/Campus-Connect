"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Zap } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")

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
          setIsActive(true)
          setError(null)
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
    }
  }, [cameraFacing])

  const simulateQRDetection = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockQRData = `TKT-${String(scanCount + 1).padStart(3, "0")}-2025|1|user${scanCount + 1}@university.edu|2025-02-15`
    onScan(mockQRData)

    setScanCount((prev) => prev + 1)
    setLastScanTime(new Date())
    setIsProcessing(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsProcessing(true)

      // Simulate image processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockQRData = `TKT-${String(scanCount + 1).padStart(3, "0")}-2025|1|upload${scanCount + 1}@university.edu|2025-02-15`
      onScan(mockQRData)

      setScanCount((prev) => prev + 1)
      setLastScanTime(new Date())
      setIsProcessing(false)
    }
  }

  const flipCamera = () => {
    setCameraFacing((prev) => (prev === "user" ? "environment" : "user"))
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500">{error}</p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Upload QR code image instead:</p>
          <label htmlFor="qr-upload">
            <Button variant="outline" className="bg-transparent cursor-pointer" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload QR Code
              </span>
            </Button>
          </label>
          <input id="qr-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover rounded-lg bg-muted" />
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
        <p className="text-sm text-muted-foreground">Position QR code within the frame</p>

        <div className="flex justify-center space-x-2">
          <Button onClick={simulateQRDetection} disabled={isProcessing} className="bg-primary hover:bg-primary/90">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Simulate QR Scan
              </>
            )}
          </Button>

          <label htmlFor="qr-upload-main">
            <Button variant="outline" className="bg-transparent cursor-pointer" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload
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
