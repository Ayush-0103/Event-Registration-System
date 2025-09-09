// Registration object structure:
// {
//   id: string - unique identifier
//   name: string - participant name
//   email: string - participant email
//   phone: string - participant phone
//   eventName: string - name of the event
//   qrCode: string - generated QR code data
//   registrationDate: string - when registered
// }

// Attendance object structure:
// {
//   id: string - unique identifier
//   registrationId: string - links to registration
//   attendanceTime: string - when attendance was marked
//   scannedBy: string - optional, who scanned the code
// }

// Event stats object structure:
// {
//   totalRegistrations: number - total people registered
//   totalAttendance: number - total people attended
//   attendanceRate: number - percentage attendance
// }

export const createRegistration = (data) => ({
  id: data.id || Date.now().toString(),
  name: data.name,
  email: data.email,
  phone: data.phone,
  eventName: data.eventName,
  qrCode: data.qrCode,
  registrationDate: data.registrationDate || new Date().toISOString(),
})

export const createAttendance = (data) => ({
  id: data.id || Date.now().toString(),
  registrationId: data.registrationId,
  attendanceTime: data.attendanceTime || new Date().toISOString(),
  scannedBy: data.scannedBy || "System",
})
