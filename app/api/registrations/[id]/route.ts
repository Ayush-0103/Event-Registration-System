import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const registrationId = params.id

    if (!registrationId) {
      return NextResponse.json({ success: false, error: "Registration ID is required" }, { status: 400 })
    }

    const registration = StorageService.getRegistrationById(registrationId)

    if (!registration) {
      return NextResponse.json({ success: false, error: "Registration not found" }, { status: 404 })
    }

    // Check attendance status
    const isAttended = StorageService.isAttendanceMarked(registrationId)

    return NextResponse.json({
      success: true,
      data: {
        ...registration,
        isAttended,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch registration" }, { status: 500 })
  }
}
