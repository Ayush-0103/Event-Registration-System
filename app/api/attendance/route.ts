import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"
import type { Attendance } from "@/lib/types"

export async function GET() {
  try {
    const attendance = StorageService.getAttendance()
    const registrations = StorageService.getRegistrations()

    // Enrich attendance data with registration details
    const enrichedAttendance = attendance.map((att) => {
      const registration = registrations.find((reg) => reg.id === att.registrationId)
      return {
        ...att,
        registration,
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedAttendance,
      count: attendance.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationId, scannedBy } = body

    if (!registrationId) {
      return NextResponse.json({ success: false, error: "Registration ID is required" }, { status: 400 })
    }

    // Verify registration exists
    const registration = StorageService.getRegistrationById(registrationId)
    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 })
    }

    // Check if already marked
    const alreadyMarked = StorageService.isAttendanceMarked(registrationId)
    if (alreadyMarked) {
      return NextResponse.json(
        { success: false, error: "Attendance already marked for this registration" },
        { status: 409 },
      )
    }

    // Create attendance record
    const attendance: Attendance = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      registrationId,
      attendanceTime: new Date().toISOString(),
      scannedBy: scannedBy || "System",
    }

    StorageService.markAttendance(attendance)

    return NextResponse.json(
      {
        success: true,
        data: {
          attendance,
          registration,
        },
        message: "Attendance marked successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to mark attendance" }, { status: 500 })
  }
}
