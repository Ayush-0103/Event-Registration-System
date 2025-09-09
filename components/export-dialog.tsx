"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Table, Code } from "lucide-react"
import { ApiClient } from "@/lib/api-client"
import { StorageService } from "@/lib/storage"

interface ExportDialogProps {
  onClose?: () => void
}

export default function ExportDialog({ onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel" | "json">("csv")
  const [eventFilter, setEventFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent">("all")
  const [isExporting, setIsExporting] = useState(false)

  const registrations = StorageService.getRegistrations()
  const attendance = StorageService.getAttendance()

  // Get unique events
  const events = Array.from(new Set(registrations.map((reg) => reg.eventName)))

  // Calculate preview counts
  let filteredCount = registrations.length
  if (eventFilter !== "all") {
    filteredCount = registrations.filter((reg) => reg.eventName === eventFilter).length
  }

  let finalCount = filteredCount
  if (statusFilter === "present") {
    const eventRegs =
      eventFilter === "all" ? registrations : registrations.filter((reg) => reg.eventName === eventFilter)
    finalCount = eventRegs.filter((reg) => attendance.some((att) => att.registrationId === reg.id)).length
  } else if (statusFilter === "absent") {
    const eventRegs =
      eventFilter === "all" ? registrations : registrations.filter((reg) => reg.eventName === eventFilter)
    finalCount = eventRegs.filter((reg) => !attendance.some((att) => att.registrationId === reg.id)).length
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await ApiClient.exportData({
        format,
        event: eventFilter === "all" ? undefined : eventFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      onClose?.()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    { value: "csv", label: "CSV", icon: FileText, description: "Comma-separated values (Excel compatible)" },
    { value: "excel", label: "Excel CSV", icon: Table, description: "CSV optimized for Microsoft Excel" },
    { value: "json", label: "JSON", icon: Code, description: "JavaScript Object Notation" },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
        <CardDescription>Choose export format and filters for your attendance data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label>Export Format</Label>
          <div className="grid grid-cols-1 gap-2">
            {formatOptions.map((option) => (
              <div
                key={option.value}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  format === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setFormat(option.value as any)}
              >
                <div className="flex items-center gap-3">
                  <option.icon className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Filter */}
        <div className="space-y-2">
          <Label>Filter by Event</Label>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event} value={event}>
                  {event}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Filter by Attendance</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter as any}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Registrations</SelectItem>
              <SelectItem value="present">Present Only</SelectItem>
              <SelectItem value="absent">Absent Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Records to export:</span>
            <Badge variant="secondary">{finalCount}</Badge>
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} disabled={isExporting || finalCount === 0} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : `Export ${finalCount} Records`}
        </Button>
      </CardContent>
    </Card>
  )
}
