"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserCheck, TrendingUp, Download, RefreshCw, Calendar, Clock, BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StorageService } from "@/lib/storage"

export default function AdminDashboard() {
  // Simple state without TypeScript types
  const [stats, setStats] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    setError("")

    try {
      console.log("[v0] Fetching data from localStorage...")

      // Get data directly from localStorage
      const statsData = StorageService.getEventStats()
      const registrationsData = StorageService.getRegistrations()
      const attendanceData = StorageService.getAttendance()

      console.log("[v0] Stats data:", statsData)
      console.log("[v0] Registrations count:", registrationsData.length)
      console.log("[v0] Attendance count:", attendanceData.length)

      // Calculate additional statistics
      const recentRegistrations = registrationsData.filter((reg) => {
        const regDate = new Date(reg.registrationDate)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return regDate > oneDayAgo
      }).length

      const recentAttendance = attendanceData.filter((att) => {
        const attDate = new Date(att.attendanceTime)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return attDate > oneHourAgo
      }).length

      // Group registrations by event
      const eventBreakdown = registrationsData.reduce((acc, reg) => {
        acc[reg.eventName] = (acc[reg.eventName] || 0) + 1
        return acc
      }, {})

      // Attendance by hour (last 24 hours)
      const hourlyAttendance = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(Date.now() - i * 60 * 60 * 1000).getHours()
        const count = attendanceData.filter((att) => {
          const attHour = new Date(att.attendanceTime).getHours()
          return attHour === hour
        }).length
        return { hour, count }
      }).reverse()

      const enhancedStats = {
        ...statsData,
        recentRegistrations,
        recentAttendance,
        eventBreakdown,
        hourlyAttendance,
        lastUpdated: new Date().toISOString(),
      }

      setStats(enhancedStats)
      setRegistrations(registrationsData)
      setAttendance(attendanceData)

      console.log("[v0] Data loaded successfully")
    } catch (err) {
      console.log("[v0] Dashboard fetch error:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async () => {
    try {
      const registrationsData = StorageService.getRegistrations()
      const attendanceData = StorageService.getAttendance()

      // Create CSV content
      const csvContent = [
        // Header
        "Name,Email,Phone,Event,Registration Date,Attendance Status,Attendance Time",
        // Data rows
        ...registrationsData.map((reg) => {
          const attendanceRecord = attendanceData.find((att) => att.registrationId === reg.id)
          return [
            reg.name,
            reg.email,
            reg.phone,
            reg.eventName,
            reg.registrationDate,
            attendanceRecord ? "Present" : "Absent",
            attendanceRecord ? attendanceRecord.attendanceTime : "",
          ].join(",")
        }),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `event-attendance-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.log("[v0] Export error:", err)
      setError("Failed to export data")
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Monitor event registrations and attendance in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => fetchData(true)} variant="outline" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                <p className="text-xs text-muted-foreground">+{stats.recentRegistrations} in last 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAttendance}</div>
                <p className="text-xs text-muted-foreground">+{stats.recentAttendance} in last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAttendance} of {stats.totalRegistrations} attended
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.eventBreakdown).length}</div>
                <p className="text-xs text-muted-foreground">Active events</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest registrations and attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendance.slice(0, 5).map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{att.registration?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">Marked attendance</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{new Date(att.attendanceTime).toLocaleTimeString()}</p>
                          <Badge variant="default" className="bg-green-600 text-xs">
                            Present
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {attendance.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No attendance records yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Event Breakdown
                  </CardTitle>
                  <CardDescription>Registrations by event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats &&
                      Object.entries(stats.eventBreakdown).map(([eventName, count]) => (
                        <div key={eventName} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{eventName}</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(count / stats.totalRegistrations) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    {(!stats || Object.keys(stats.eventBreakdown).length === 0) && (
                      <p className="text-gray-500 text-center py-4">No events yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Registrations</CardTitle>
                <CardDescription>Complete list of event registrations with attendance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations.map((reg) => {
                    const isAttended = attendance.some((att) => att.registrationId === reg.id)
                    return (
                      <div key={reg.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{reg.name}</h3>
                            <Badge
                              variant={isAttended ? "default" : "secondary"}
                              className={isAttended ? "bg-green-600" : ""}
                            >
                              {isAttended ? "Present" : "Registered"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Email: {reg.email}</p>
                            <p>Phone: {reg.phone}</p>
                            <p>Event: {reg.eventName}</p>
                            <p>Registered: {new Date(reg.registrationDate).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-mono">{reg.id}</p>
                        </div>
                      </div>
                    )
                  })}
                  {registrations.length === 0 && <p className="text-gray-500 text-center py-8">No registrations yet</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>All attendance records with timestamps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendance.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{att.registration?.name || "Unknown"}</h3>
                          <Badge variant="default" className="bg-green-600">
                            Present
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Email: {att.registration?.email || "N/A"}</p>
                          <p>Event: {att.registration?.eventName || "N/A"}</p>
                          <p>Marked: {new Date(att.attendanceTime).toLocaleString()}</p>
                          <p>Scanned by: {att.scannedBy}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-mono">{att.registrationId}</p>
                      </div>
                    </div>
                  ))}
                  {attendance.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No attendance records yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>Detailed analytics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Hourly Attendance Chart */}
                  <div>
                    <h3 className="font-medium mb-4">Attendance by Hour (Last 24h)</h3>
                    <div className="grid grid-cols-12 gap-1 h-32">
                      {stats?.hourlyAttendance.map((data, index) => (
                        <div key={index} className="flex flex-col items-center justify-end">
                          <div
                            className="bg-blue-600 w-full rounded-t"
                            style={{
                              height: `${data.count > 0 ? Math.max((data.count / Math.max(...stats.hourlyAttendance.map((h) => h.count))) * 100, 10) : 0}%`,
                            }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-1">{data.hour}h</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Registration Rate</h4>
                      <p className="text-2xl font-bold text-blue-600">{stats?.recentRegistrations || 0}</p>
                      <p className="text-sm text-blue-600">New registrations (24h)</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200">Check-in Rate</h4>
                      <p className="text-2xl font-bold text-green-600">{stats?.recentAttendance || 0}</p>
                      <p className="text-sm text-green-600">New check-ins (1h)</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200">Conversion</h4>
                      <p className="text-2xl font-bold text-purple-600">{stats?.attendanceRate || 0}%</p>
                      <p className="text-sm text-purple-600">Registration to attendance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
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
