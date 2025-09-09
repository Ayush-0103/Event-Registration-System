import { NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const eventFilter = searchParams.get("event")
    const statusFilter = searchParams.get("status") // 'present', 'absent', 'all'

    const registrations = StorageService.getRegistrations()
    const attendance = StorageService.getAttendance()

    // Apply filters
    let filteredRegistrations = registrations

    if (eventFilter && eventFilter !== "all") {
      filteredRegistrations = registrations.filter((reg) => reg.eventName === eventFilter)
    }

    const exportData = filteredRegistrations.map((reg) => {
      const attendanceRecord = attendance.find((att) => att.registrationId === reg.id)
      const isPresent = !!attendanceRecord

      return {
        registrationId: reg.id,
        name: reg.name,
        email: reg.email,
        phone: reg.phone,
        eventName: reg.eventName,
        registrationDate: new Date(reg.registrationDate).toLocaleString(),
        attendanceStatus: isPresent ? "Present" : "Absent",
        attendanceTime: attendanceRecord ? new Date(attendanceRecord.attendanceTime).toLocaleString() : "",
        scannedBy: attendanceRecord ? attendanceRecord.scannedBy || "" : "",
      }
    })

    // Apply status filter
    let finalData = exportData
    if (statusFilter === "present") {
      finalData = exportData.filter((item) => item.attendanceStatus === "Present")
    } else if (statusFilter === "absent") {
      finalData = exportData.filter((item) => item.attendanceStatus === "Absent")
    }

    const timestamp = new Date().toISOString().split("T")[0]
    const baseFilename = `event-attendance-${timestamp}`

    if (format === "json") {
      return NextResponse.json(finalData, {
        headers: {
          "Content-Disposition": `attachment; filename="${baseFilename}.json"`,
        },
      })
    } else if (format === "excel") {
      const csvHeaders = [
        "Registration ID",
        "Name",
        "Email",
        "Phone",
        "Event Name",
        "Registration Date",
        "Attendance Status",
        "Attendance Time",
        "Scanned By",
      ]

      const csvRows = finalData.map((item) => [
        item.registrationId,
        item.name,
        item.email,
        item.phone,
        item.eventName,
        item.registrationDate,
        item.attendanceStatus,
        item.attendanceTime,
        item.scannedBy,
      ])

      // Add BOM for Excel compatibility
      const BOM = "\uFEFF"
      const csvContent =
        BOM +
        [
          csvHeaders.join(","),
          ...csvRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
        ].join("\n")

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${baseFilename}.csv"`,
        },
      })
    } else {
      // Default CSV format
      const csvHeaders = [
        "Registration ID",
        "Name",
        "Email",
        "Phone",
        "Event Name",
        "Registration Date",
        "Attendance Status",
        "Attendance Time",
        "Scanned By",
      ]

      const csvRows = finalData.map((item) => [
        item.registrationId,
        item.name,
        item.email,
        item.phone,
        item.eventName,
        item.registrationDate,
        item.attendanceStatus,
        item.attendanceTime,
        item.scannedBy,
      ])

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${baseFilename}.csv"`,
        },
      })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to export data" }, { status: 500 })
  }
}
