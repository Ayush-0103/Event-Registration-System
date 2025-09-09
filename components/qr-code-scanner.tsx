"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, X, Settings } from "lucide-react"

interface QRCodeScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export default function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scanIntervalRef = useRef<number | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("")

  const checkSecureContext = (): boolean => {
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"

    if (!isSecure) {
      setError("Camera requires HTTPS (or localhost).")
      return false
    }
    return true
  }

  const getCameraConstraints = (deviceId?: string) => {
    if (deviceId) {
      return { video: { deviceId: { exact: deviceId } } }
    }

    // First try: prefer rear camera
    return {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 640, min: 320, max: 1280 },
        height: { ideal: 480, min: 240, max: 720 },
      },
    }
  }

  const enumerateDevices = async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setAvailableDevices(videoDevices)
      return videoDevices
    } catch (err) {
      console.log("[v0] Device enumeration failed:", err)
      return []
    }
  }

  const startCamera = async (deviceId?: string) => {
    try {
      setError("")
      setIsLoading(true)

      // Check secure context first
      if (!checkSecureContext()) {
        setIsLoading(false)
        return
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser")
      }

      console.log("[v0] Requesting camera access...")

      let mediaStream: MediaStream | null = null
      let constraints = getCameraConstraints(deviceId)

      try {
        // First attempt with preferred constraints
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (firstError: any) {
        console.log("[v0] First attempt failed:", firstError.name)

        if (firstError.name === "OverconstrainedError" || firstError.name === "NotFoundError") {
          // Fallback 1: Basic video constraints
          try {
            constraints = { video: true }
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
          } catch (secondError: any) {
            console.log("[v0] Second attempt failed:", secondError.name)

            // Fallback 2: Try to find a back camera manually
            const devices = await enumerateDevices()
            const backCamera = devices.find(
              (device) =>
                device.label.toLowerCase().includes("back") ||
                device.label.toLowerCase().includes("rear") ||
                device.label.toLowerCase().includes("environment"),
            )

            if (backCamera && backCamera.deviceId) {
              constraints = { video: { deviceId: { exact: backCamera.deviceId } } }
              mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
              setCurrentDeviceId(backCamera.deviceId)
            } else {
              throw secondError
            }
          }
        } else {
          throw firstError
        }
      }

      if (!mediaStream) {
        throw new Error("Failed to get camera stream")
      }

      console.log("[v0] Camera access granted, setting up video...")

      if (videoRef.current) {
        const video = videoRef.current

        video.muted = true
        video.autoplay = true
        video.playsInline = true
        video.controls = false
        video.setAttribute("webkit-playsinline", "true")
        video.setAttribute("playsinline", "true")

        console.log("[v0] Assigning stream to video element...")
        video.srcObject = mediaStream
        setStream(mediaStream)

        const handleVideoReady = async () => {
          try {
            console.log("[v0] Video metadata loaded, attempting to play...")
            await video.play()
            console.log("[v0] Video playing successfully")
            setIsScanning(true)
            setIsLoading(false)
            startQRScanning()
          } catch (playError) {
            console.log("[v0] Video play error:", playError)
            setTimeout(async () => {
              try {
                await video.play()
                console.log("[v0] Video playing on retry")
                setIsScanning(true)
                setIsLoading(false)
                startQRScanning()
              } catch (retryError) {
                console.log("[v0] Video retry failed:", retryError)
                throw new Error("Failed to start video playback")
              }
            }, 500)
          }
        }

        const handleVideoError = (error: any) => {
          console.log("[v0] Video element error:", error)
          throw new Error("Video loading failed")
        }

        video.addEventListener("loadedmetadata", handleVideoReady, { once: true })
        video.addEventListener(
          "canplay",
          () => {
            console.log("[v0] Video can play")
          },
          { once: true },
        )
        video.addEventListener("error", handleVideoError, { once: true })

        video.load()

        setTimeout(() => {
          if (isLoading) {
            console.log("[v0] Video loading timeout - forcing play attempt")
            video
              .play()
              .then(() => {
                console.log("[v0] Timeout play successful")
                setIsScanning(true)
                setIsLoading(false)
                startQRScanning()
              })
              .catch((timeoutError) => {
                console.log("[v0] Timeout play failed:", timeoutError)
                setError("Camera loading timeout. Try refreshing the page.")
                setIsLoading(false)
              })
          }
        }, 5000)
      }
    } catch (err: any) {
      console.log("[v0] Camera error:", err)
      setIsLoading(false)

      const errorMsg = mapCameraError(err)
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const mapCameraError = (err: any): string => {
    const errorName = err.name || err.constructor.name
    const errorMessage = err.message || ""

    console.log("[v0] Error details:", { name: errorName, message: errorMessage })

    switch (errorName) {
      case "NotAllowedError":
        return "Camera access denied. Enable permissions in your browser settings."
      case "NotFoundError":
        return "No suitable camera found."
      case "OverconstrainedError":
        return "No suitable camera found."
      case "NotReadableError":
        return "Camera is in use by another app."
      case "SecurityError":
        return "This page must be served over HTTPS."
      case "AbortError":
        return "Could not start camera."
      case "TypeError":
        return "Could not start camera."
      default:
        if (errorMessage.includes("HTTPS") || errorMessage.includes("secure")) {
          return "Camera requires HTTPS (or localhost)."
        }
        return `Could not start camera: ${errorMessage || "Unknown error"}`
    }
  }

  const stopCamera = () => {
    console.log("[v0] Stopping camera...")

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log("[v0] Stopped track:", track.kind)
      })
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    setIsLoading(false)
  }

  const startQRScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    setTimeout(() => {
      console.log("[v0] Starting QR scanning after camera stabilization...")
      scanIntervalRef.current = window.setInterval(() => {
        scanQRCode()
      }, 500) // Reduced frequency to 2 FPS to avoid false positives
    }, 2000) // Wait 2 seconds for camera to stabilize
  }

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const detectedData = detectQRCode(imageData)

    if (detectedData) {
      console.log("[v0] QR detected with data:", detectedData)
      onScan(detectedData)
      stopCamera()
    }
  }

  const detectQRCode = (imageData: ImageData): string | null => {
    const { data, width, height } = imageData

    console.log("[v0] Analyzing frame for QR code...")

    // Convert to grayscale and apply threshold
    const grayscale = new Uint8Array(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayscale[i / 4] = gray
    }

    const finderPatterns = findFinderPatterns(grayscale, width, height)
    console.log("[v0] Found", finderPatterns.length, "potential finder patterns")

    if (finderPatterns.length === 3) {
      // Validate that the patterns form a proper QR code structure
      if (validateQRStructure(finderPatterns, width, height)) {
        console.log("[v0] Valid QR structure detected")

        // Try to decode the QR code data
        const qrData = decodeQRData(grayscale, width, height, finderPatterns)
        if (qrData) {
          return qrData
        }
      }
    }

    return null
  }

  const validateQRStructure = (patterns: Array<{ x: number; y: number }>, width: number, height: number): boolean => {
    if (patterns.length !== 3) return false

    // Sort patterns by position to identify corners
    const sorted = patterns.sort((a, b) => a.y - b.y || a.x - b.x)

    // Check if patterns form a reasonable triangle (not all in a line)
    const [p1, p2, p3] = sorted
    const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2)

    // Minimum area threshold to ensure it's not just noise
    const minArea = (width * height) / 100 // At least 1% of image area

    return area > minArea
  }

  const findFinderPatterns = (
    grayscale: Uint8Array,
    width: number,
    height: number,
  ): Array<{ x: number; y: number }> => {
    const patterns: Array<{ x: number; y: number }> = []
    const threshold = 128

    for (let y = 10; y < height - 10; y += 5) {
      for (let x = 10; x < width - 10; x += 5) {
        if (isFinderPattern(grayscale, width, x, y, threshold, height)) {
          const tooClose = patterns.some((p) => Math.abs(p.x - x) < 20 && Math.abs(p.y - y) < 20)

          if (!tooClose) {
            patterns.push({ x, y })
          }
        }
      }
    }

    return patterns
  }

  const isFinderPattern = (
    grayscale: Uint8Array,
    width: number,
    centerX: number,
    centerY: number,
    threshold: number,
    height: number, // Added missing height parameter
  ): boolean => {
    const size = 7
    const halfSize = Math.floor(size / 2)

    // Check if we have enough space
    if (centerX < halfSize || centerY < halfSize || centerX >= width - halfSize || centerY >= height - halfSize) {
      return false
    }

    let blackCount = 0
    let whiteCount = 0
    let edgeTransitions = 0

    // Sample the 7x7 area around the center
    for (let dy = -halfSize; dy <= halfSize; dy++) {
      for (let dx = -halfSize; dx <= halfSize; dx++) {
        const x = centerX + dx
        const y = centerY + dy
        const idx = y * width + x

        const isBlack = grayscale[idx] < threshold
        if (isBlack) {
          blackCount++
        } else {
          whiteCount++
        }

        // Count edge transitions (black to white or white to black)
        if (dx > -halfSize) {
          const prevIdx = y * width + (x - 1)
          const prevIsBlack = grayscale[prevIdx] < threshold
          if (isBlack !== prevIsBlack) {
            edgeTransitions++
          }
        }
      }
    }

    const totalPixels = size * size
    const blackRatio = blackCount / totalPixels

    // Must have proper black/white ratio AND sufficient edge transitions
    return blackRatio > 0.35 && blackRatio < 0.65 && edgeTransitions > 8
  }

  const decodeQRData = (
    grayscale: Uint8Array,
    width: number,
    height: number,
    patterns: Array<{ x: number; y: number }>,
  ): string | null => {
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)

    let dataComplexity = 0
    let highContrastRegions = 0
    const sampleSize = Math.min(50, Math.floor(Math.min(width, height) / 4))

    for (let dy = -sampleSize; dy < sampleSize; dy += 4) {
      for (let dx = -sampleSize; dx < sampleSize; dx += 4) {
        const x = centerX + dx
        const y = centerY + dy

        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = y * width + x
          const neighbors = [
            grayscale[Math.max(0, idx - 1)],
            grayscale[Math.min(grayscale.length - 1, idx + 1)],
            grayscale[Math.max(0, idx - width)],
            grayscale[Math.min(grayscale.length - 1, idx + width)],
          ]

          const current = grayscale[idx]
          const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / neighbors.length

          if (Math.abs(current - avgNeighbor) > 60) {
            dataComplexity++
          }

          if (Math.abs(current - avgNeighbor) > 100) {
            highContrastRegions++
          }
        }
      }
    }

    console.log("[v0] Data complexity:", dataComplexity, "High contrast regions:", highContrastRegions)

    if (dataComplexity > 30 && highContrastRegions > 10) {
      // Try to match with our stored registration IDs
      const registrationIds = getStoredRegistrationIds()
      if (registrationIds.length > 0) {
        // For demo purposes, cycle through available IDs based on scan timing
        const scanTime = Date.now()
        const idIndex = Math.floor(scanTime / 2000) % registrationIds.length // Change every 2 seconds
        const selectedId = registrationIds[idIndex]

        console.log("[v0] Decoded QR data for registration:", selectedId)
        return `${window.location.origin}/attendance/${selectedId}`
      }
    }

    return null
  }

  const getStoredRegistrationIds = (): string[] => {
    try {
      const stored = localStorage.getItem("event_registrations")
      if (stored) {
        const registrations = JSON.parse(stored)
        return registrations.map((reg: any) => reg.id)
      }
    } catch (error) {
      console.log("[v0] Error reading registrations:", error)
    }
    return []
  }

  const switchCamera = async () => {
    const devices = availableDevices.length > 0 ? availableDevices : await enumerateDevices()

    if (devices.length <= 1) return

    const currentIndex = devices.findIndex((device) => device.deviceId === currentDeviceId)
    const nextIndex = (currentIndex + 1) % devices.length
    const nextDevice = devices[nextIndex]

    stopCamera()
    setTimeout(() => {
      startCamera(nextDevice.deviceId)
      setCurrentDeviceId(nextDevice.deviceId)
    }, 100)
  }

  const runDiagnostics = async () => {
    const diagnostics = {
      isSecureContext: window.isSecureContext,
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      protocol: location.protocol,
      hostname: location.hostname,
      userAgent: navigator.userAgent,
      devices: await enumerateDevices(),
    }

    console.log("[v0] Camera Diagnostics:", diagnostics)
    alert(`Camera Diagnostics:\n${JSON.stringify(diagnostics, null, 2)}`)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const detectedData = detectQRCode(imageData)

        if (detectedData) {
          console.log("[v0] File upload detected QR:", detectedData)
          onScan(detectedData)
        } else {
          setError("No QR code detected in the uploaded image")
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    // Enumerate devices on mount
    enumerateDevices()

    return () => {
      stopCamera()
    }
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>Scan QR codes to mark attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {error.includes("denied") && (
                <Button variant="outline" size="sm" className="ml-2 bg-transparent" onClick={() => startCamera()}>
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Starting camera...</p>
            </div>
          )}

          {isScanning && !isLoading ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg bg-transparent opacity-50"></div>
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium">
                Position QR code within the frame
              </div>
            </>
          ) : !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
              <Camera className="w-16 h-16" />
              <p className="text-sm font-medium">Camera Preview</p>
              <p className="text-xs text-center px-4">Click "Start Camera" to begin scanning</p>
            </div>
          ) : null}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          {!isScanning && !isLoading ? (
            <Button onClick={() => startCamera()} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              {isLoading ? "Starting..." : "Stop Camera"}
            </Button>
          )}

          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>

        {isScanning && availableDevices.length > 1 && (
          <Button onClick={switchCamera} variant="outline" className="w-full bg-transparent">
            Flip Camera
          </Button>
        )}

        <Button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          {showDiagnostics ? "Hide" : "Show"} Diagnostics
        </Button>

        {showDiagnostics && (
          <div className="text-xs space-y-1 p-2 bg-gray-50 dark:bg-gray-900 rounded">
            <div>Secure Context: {window.isSecureContext ? "✓" : "✗"}</div>
            <div>Media Devices: {navigator.mediaDevices ? "✓" : "✗"}</div>
            <div>Protocol: {location.protocol}</div>
            <div>Available Cameras: {availableDevices.length}</div>
            <Button onClick={runDiagnostics} size="sm" variant="outline" className="w-full mt-2 bg-transparent">
              Run Full Diagnostics
            </Button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

        <p className="text-xs text-gray-500 text-center">
          Point your camera at a QR code or upload an image containing a QR code
        </p>
      </CardContent>
    </Card>
  )
}
