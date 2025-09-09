import { StorageService } from "@/lib/storage"
import { generateRegistrationId, generateQRCodeData } from "@/lib/qr-generator"
import type { Registration, Attendance } from "@/lib/types"

// Sample registration data
const sampleRegistrations: Omit<Registration, "id" | "qrCode" | "registrationDate">[] = [
  {
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1-555-0101",
    eventName: "Tech Conference 2024",
  },
  {
    name: "Bob Smith",
    email: "bob.smith@email.com",
    phone: "+1-555-0102",
    eventName: "Tech Conference 2024",
  },
  {
    name: "Carol Davis",
    email: "carol.davis@email.com",
    phone: "+1-555-0103",
    eventName: "Marketing Summit",
  },
  {
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1-555-0104",
    eventName: "Tech Conference 2024",
  },
  {
    name: "Emma Brown",
    email: "emma.brown@email.com",
    phone: "+1-555-0105",
    eventName: "Design Workshop",
  },
  {
    name: "Frank Miller",
    email: "frank.miller@email.com",
    phone: "+1-555-0106",
    eventName: "Tech Conference 2024",
  },
  {
    name: "Grace Lee",
    email: "grace.lee@email.com",
    phone: "+1-555-0107",
    eventName: "Marketing Summit",
  },
  {
    name: "Henry Taylor",
    email: "henry.taylor@email.com",
    phone: "+1-555-0108",
    eventName: "Design Workshop",
  },
]

function seedSampleData() {
  console.log("[v0] Starting to seed sample data...")

  // Clear existing data
  if (typeof window !== "undefined") {
    localStorage.removeItem("event_registrations")
    localStorage.removeItem("event_attendance")
  }

  const registrations: Registration[] = []
  const attendanceRecords: Attendance[] = []

  // Create registrations
  sampleRegistrations.forEach((sample, index) => {
    const registrationId = generateRegistrationId()
    const qrCodeData = generateQRCodeData(registrationId)

    // Vary registration dates over the past week
    const daysAgo = Math.floor(Math.random() * 7)
    const hoursAgo = Math.floor(Math.random() * 24)
    const registrationDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000)

    const registration: Registration = {
      id: registrationId,
      name: sample.name,
      email: sample.email,
      phone: sample.phone,
      eventName: sample.eventName,
      qrCode: qrCodeData,
      registrationDate: registrationDate.toISOString(),
    }

    registrations.push(registration)
    StorageService.saveRegistration(registration)

    // Mark attendance for some registrations (about 60% attendance rate)
    if (Math.random() < 0.6) {
      const minutesAfterReg = Math.floor(Math.random() * 120) + 30 // 30-150 minutes after registration
      const attendanceTime = new Date(registrationDate.getTime() + minutesAfterReg * 60 * 1000)

      const attendance: Attendance = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        registrationId: registrationId,
        attendanceTime: attendanceTime.toISOString(),
        scannedBy: index % 3 === 0 ? "Scanner Station A" : index % 3 === 1 ? "Scanner Station B" : "Mobile Scanner",
      }

      attendanceRecords.push(attendance)
      StorageService.markAttendance(attendance)
    }
  })

  console.log(`[v0] Created ${registrations.length} sample registrations`)
  console.log(`[v0] Created ${attendanceRecords.length} sample attendance records`)
  console.log("[v0] Sample data seeding completed!")

  // Display summary
  const stats = StorageService.getEventStats()
  console.log("[v0] Current stats:", stats)

  return {
    registrations: registrations.length,
    attendance: attendanceRecords.length,
    attendanceRate: stats.attendanceRate,
  }
}

// Auto-run if in browser environment
if (typeof window !== "undefined") {
  // Check if data already exists
  const existingRegistrations = StorageService.getRegistrations()

  if (existingRegistrations.length === 0) {
    console.log("[v0] No existing data found, seeding sample data...")
    seedSampleData()
  } else {
    console.log(`[v0] Found ${existingRegistrations.length} existing registrations, skipping seed`)
  }
}

export { seedSampleData }
