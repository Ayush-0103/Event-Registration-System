import { NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"

export async function GET() {
  try {
    const stats = StorageService.getEventStats()
    const registrations = StorageService.getRegistrations()
    const attendance = StorageService.getAttendance()

    // Calculate additional statistics
    const recentRegistrations = registrations.filter((reg) => {
      const regDate = new Date(reg.registrationDate)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return regDate > oneDayAgo
    }).length

    const recentAttendance = attendance.filter((att) => {
      const attDate = new Date(att.attendanceTime)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return attDate > oneHourAgo
    }).length

    // Group registrations by event
    const eventBreakdown = registrations.reduce(
      (acc, reg) => {
        acc[reg.eventName] = (acc[reg.eventName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Attendance by hour (last 24 hours)
    const hourlyAttendance = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(Date.now() - i * 60 * 60 * 1000).getHours()
      const count = attendance.filter((att) => {
        const attHour = new Date(att.attendanceTime).getHours()
        return attHour === hour
      }).length
      return { hour, count }
    }).reverse()

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        recentRegistrations,
        recentAttendance,
        eventBreakdown,
        hourlyAttendance,
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
