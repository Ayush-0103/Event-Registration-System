"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, Smartphone } from "lucide-react"
import { generateQRCodeOnCanvas } from "@/lib/qr-generator"
import { useState } from "react"

interface QRCodeDisplayProps {
  value: string
  registrationId: string
}

export default function QRCodeDisplay({ value, registrationId }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    generateQRCodeOnCanvas(canvas, value)
  }, [value])

  const downloadQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create download link
    const link = document.createElement("a")
    link.download = `event-qr-${registrationId}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-100">
        <canvas
          ref={canvasRef}
          className="rounded-lg border-2 border-gray-100"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Smartphone className="w-5 h-5" />
          <span className="font-semibold">Ready to Scan!</span>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Registration ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{registrationId}</span>
        </p>
        <p className="text-xs text-gray-500 max-w-xs break-all">
          Attendance URL: <span className="font-mono">{value}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={downloadQRCode} variant="outline" size="sm" className="flex-1 bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Save QR Code
        </Button>
        <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex-1 bg-transparent">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-xl text-center max-w-md border border-blue-200 dark:border-blue-800">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">📱 Scan Instructions</p>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            Use any QR code scanner app or your phone's camera to scan this code. It will automatically mark your
            attendance for the event.
          </p>
        </div>
      </div>
    </div>
  )
}
