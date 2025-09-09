"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, RefreshCw, ArrowLeft, Users, UserCheck, TrendingUp } from "lucide-react"
import Link from "next/link"
import { seedSampleData } from "@/scripts/seed-sample-data"
import { StorageService } from "@/lib/storage"

export default function SeedDataPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{
    registrations: number
    attendance: number
    attendanceRate: number
  } | null>(null)
  const [error, setError] = useState("")

  const handleSeedData = async () => {
    setIsSeeding(true)
    setError("")
    setSeedResult(null)

    try {
      const result = seedSampleData()
      setSeedResult(result)
    } catch (err) {
      setError("Failed to seed sample data")
    } finally {
      setIsSeeding(false)
    }
  }

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("event_registrations")
      localStorage.removeItem("event_attendance")
      setSeedResult(null)
      setError("")
    }
  }

  const currentStats = StorageService.getEventStats()
  const registrations = StorageService.getRegistrations()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sample Data Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Populate the system with sample registrations and attendance data for testing
          </p>
        </div>

        {/* Current Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Current Data Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-blue-600 mr-1" />
                </div>
                <div className="text-2xl font-bold">{currentStats.totalRegistrations}</div>
                <div className="text-sm text-gray-500">Registrations</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="w-4 h-4 text-green-600 mr-1" />
                </div>
                <div className="text-2xl font-bold">{currentStats.totalAttendance}</div>
                <div className="text-sm text-gray-500">Attendance</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                </div>
                <div className="text-2xl font-bold">{currentStats.attendanceRate}%</div>
                <div className="text-sm text-gray-500">Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {seedResult && (
          <Alert className="mb-6">
            <AlertDescription>
              Successfully created {seedResult.registrations} registrations and {seedResult.attendance} attendance
              records. Attendance rate: {seedResult.attendanceRate}%
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Data Management Actions</CardTitle>
            <CardDescription>Seed the system with sample data or clear existing data for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSeedData} disabled={isSeeding} className="flex-1">
                <RefreshCw className={`w-4 h-4 mr-2 ${isSeeding ? "animate-spin" : ""}`} />
                {isSeeding ? "Seeding Data..." : "Seed Sample Data"}
              </Button>

              <Button
                onClick={handleClearData}
                variant="outline"
                className="flex-1 bg-transparent"
                disabled={registrations.length === 0}
              >
                Clear All Data
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Sample Data Includes:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 8 sample registrations across 3 different events</li>
                <li>• Realistic attendance data (approximately 60% attendance rate)</li>
                <li>• Varied registration and attendance timestamps</li>
                <li>• Multiple scanner stations for attendance tracking</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Button asChild variant="ghost">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
