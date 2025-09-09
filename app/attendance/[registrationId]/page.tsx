"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ArrowLeft, User, Calendar } from "lucide-react"
import Link from "next/link"
import { StorageService } from "@/lib/storage"
import type { Registration } from "@/lib/types"

export default function AttendancePage() {
  const params = useParams()
  const registrationId = params.registrationId as string
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isAttended, setIsAttended] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (registrationId) {
      const reg = StorageService.getRegistrationById(registrationId)
      setRegistration(reg)

      if (reg) {
        const attended = StorageService.isAttendanceMarked(registrationId)
        setIsAttended(attended)
      }

      setLoading(false)
    }
  }, [registrationId])

  const markAttendance = () => {
    if (!registration) return

    const attendance = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      registrationId: registration.id,
      attendanceTime: new Date().toISOString(),
      scannedBy: "Self-Check",
    }

    StorageService.markAttendance(attendance)
    setIsAttended(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <p>Loading registration details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-800 dark:text-red-200">Registration Not Found</CardTitle>
            <CardDescription>The registration ID "{registrationId}" was not found in our system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isAttended ? "bg-green-100 dark:bg-green-900" : "bg-blue-100 dark:bg-blue-900"
              }`}
            >
              {isAttended ? (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <CardTitle className="text-2xl">{isAttended ? "Attendance Confirmed" : "Mark Attendance"}</CardTitle>
            <CardDescription>
              {isAttended
                ? "Your attendance has been successfully recorded"
                : "Click the button below to mark your attendance"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Registration Details
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{registration.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="truncate ml-2">{registration.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Event:</span>
                  <span>{registration.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Registration Date:</span>
                  <span>{new Date(registration.registrationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={isAttended ? "default" : "secondary"} className={isAttended ? "bg-green-600" : ""}>
                    {isAttended ? "Present" : "Registered"}
                  </Badge>
                </div>
              </div>
            </div>

            {isAttended ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Your attendance has been marked. Thank you for attending the event!</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>Click the button below to confirm your attendance at the event.</AlertDescription>
                </Alert>

                <Button onClick={markAttendance} className="w-full" size="lg">
                  Mark My Attendance
                </Button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              {isAttended && (
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/admin">View Dashboard</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
