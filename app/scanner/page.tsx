"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ArrowLeft, User, Clock } from "lucide-react"
import Link from "next/link"
import QRCodeScanner from "@/components/qr-code-scanner"
import { StorageService } from "@/lib/storage"
import type { Registration, Attendance } from "@/lib/types"

interface ScanResult {
  success: boolean
  message: string
  registration?: Registration
  attendance?: Attendance
}

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleScan = async (qrData: string) => {
    setIsProcessing(true)

    try {
      // Extract registration ID from QR data
      const registrationId = extractRegistrationId(qrData)

      if (!registrationId) {
        setScanResult({
          success: false,
          message: "Invalid QR code format. Please scan a valid event registration QR code.",
        })
        return
      }

      // Find registration
      const registration = StorageService.getRegistrationById(registrationId)

      if (!registration) {
        setScanResult({
          success: false,
          message: "Registration not found. This QR code may be invalid or from a different event.",
        })
        return
      }

      // Check if already marked attendance
      const alreadyMarked = StorageService.isAttendanceMarked(registrationId)

      if (alreadyMarked) {
        setScanResult({
          success: false,
          message: "Attendance already marked for this registration.",
          registration,
        })
        return
      }

      // Mark attendance
      const attendance: Attendance = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        registrationId,
        attendanceTime: new Date().toISOString(),
        scannedBy: "Scanner", // In real app, this would be the scanner operator
      }

      StorageService.markAttendance(attendance)

      setScanResult({
        success: true,
        message: "Attendance marked successfully!",
        registration,
        attendance,
      })
    } catch (error) {
      setScanResult({
        success: false,
        message: "Error processing QR code. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScanError = (error: string) => {
    setScanResult({
      success: false,
      message: error,
    })
  }

  const extractRegistrationId = (qrData: string): string | null => {
    try {
      // Extract registration ID from URL like: http://localhost:3000/attendance/reg_123456_abc
      const url = new URL(qrData)
      const pathParts = url.pathname.split("/")
      const registrationId = pathParts[pathParts.length - 1]

      if (registrationId && registrationId.startsWith("reg_")) {
        return registrationId
      }

      return null
    } catch {
      return null
    }
  }

  const resetScanner = () => {
    setScanResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">QR Code Scanner</h1>
          <p className="text-gray-600 dark:text-gray-300">Scan attendee QR codes to mark their attendance</p>
        </div>

        {!scanResult ? (
          <div className="space-y-6">
            <QRCodeScanner onScan={handleScan} onError={handleScanError} />

            {isProcessing && (
              <Alert>
                <AlertDescription>Processing QR code...</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  scanResult.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                )}
              </div>
              <CardTitle
                className={`text-2xl ${
                  scanResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                }`}
              >
                {scanResult.success ? "Attendance Marked!" : "Scan Failed"}
              </CardTitle>
              <CardDescription>{scanResult.message}</CardDescription>
            </CardHeader>

            {scanResult.registration && (
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Registration Details
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{scanResult.registration.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="truncate ml-2">{scanResult.registration.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{scanResult.registration.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Event:</span>
                      <span>{scanResult.registration.eventName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Registration ID:</span>
                      <span className="font-mono text-xs">{scanResult.registration.id}</span>
                    </div>
                  </div>
                </div>

                {scanResult.attendance && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-800 dark:text-green-200">
                      <Clock className="w-4 h-4" />
                      Attendance Information
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Marked At:</span>
                        <span>{new Date(scanResult.attendance.attendanceTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Scanned By:</span>
                        <span>{scanResult.attendance.scannedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge variant="default" className="bg-green-600">
                          Present
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={resetScanner} className="flex-1">
                    Scan Another QR Code
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href="/admin">View Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            )}

            {!scanResult.registration && (
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={resetScanner} className="flex-1">
                    Try Again
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
