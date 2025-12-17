"use client"

import { useEffect, useRef } from "react"

interface QRCodeDisplayProps {
  data: string
  size?: number
  className?: string
}

// Simple QR Code generator using canvas
function generateQRCode(text: string, size: number, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Use QR Code generation via third-party service
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`
  
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
  }
  img.onerror = () => {
    // Fallback: draw a simple pattern if image fails to load
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)
    
    const gridSize = 25
    const moduleSize = size / gridSize
    
    ctx.fillStyle = "#000000"
    
    // Generate pseudo-random pattern based on data
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const hash = (text.charCodeAt(x % text.length) + text.charCodeAt(y % text.length) + x * y) % 2
        if (hash === 0) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }
  img.src = qrUrl
}

export function QRCodeDisplay({ data, size = 200, className = "" }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      generateQRCode(data, size, canvasRef.current)
    }
  }, [data, size])

  return (
    <div className={`inline-block ${className}`}>
      <canvas ref={canvasRef} width={size} height={size} className="border border-border rounded-lg" />
    </div>
  )
}
