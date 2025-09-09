import { type NextRequest, NextResponse } from "next/server"
import { StorageService } from "@/lib/storage"
import { generateRegistrationId, generateQRCodeData } from "@/lib/qr-generator"
import type { Registration } from "@/lib/types"

export async function GET() {
  try {
    const registrations = StorageService.getRegistrations()
    return NextResponse.json({
      success: true,
      data: registrations,
      count: registrations.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, eventName } = body

    // Validate required fields
    if (!name || !email || !phone || !eventName) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Check if email already registered
    const existingRegistration = StorageService.getRegistrationByEmail(email)
    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: "This email is already registered for the event" },
        { status: 409 },
      )
    }

    // Generate registration
    const registrationId = generateRegistrationId()
    const qrCodeData = generateQRCodeData(registrationId)

    const newRegistration: Registration = {
      id: registrationId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      eventName: eventName.trim(),
      qrCode: qrCodeData,
      registrationDate: new Date().toISOString(),
    }

    // Save registration
    StorageService.saveRegistration(newRegistration)

    return NextResponse.json(
      {
        success: true,
        data: newRegistration,
        message: "Registration successful",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}
