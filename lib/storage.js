// Local storage keys
const REGISTRATIONS_KEY = "event_registrations"
const ATTENDANCE_KEY = "event_attendance"

export class StorageService {
  // Registration methods
  static getRegistrations() {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(REGISTRATIONS_KEY)
    return data ? JSON.parse(data) : []
  }

  static saveRegistration(registration) {
    const registrations = this.getRegistrations()
    registrations.push(registration)
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations))
  }

  static getRegistrationByEmail(email) {
    const registrations = this.getRegistrations()
    return registrations.find((reg) => reg.email === email) || null
  }

  static getRegistrationById(id) {
    const registrations = this.getRegistrations()
    return registrations.find((reg) => reg.id === id) || null
  }

  // Attendance methods
  static getAttendance() {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(ATTENDANCE_KEY)
    return data ? JSON.parse(data) : []
  }

  static markAttendance(attendance) {
    const attendanceRecords = this.getAttendance()
    // Check if already marked
    const existing = attendanceRecords.find((a) => a.registrationId === attendance.registrationId)
    if (!existing) {
      attendanceRecords.push(attendance)
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords))
    }
  }

  static isAttendanceMarked(registrationId) {
    const attendanceRecords = this.getAttendance()
    return attendanceRecords.some((a) => a.registrationId === registrationId)
  }

  // Statistics
  static getEventStats() {
    const registrations = this.getRegistrations()
    const attendance = this.getAttendance()
    const totalRegistrations = registrations.length
    const totalAttendance = attendance.length
    const attendanceRate = totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0

    return {
      totalRegistrations,
      totalAttendance,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    }
  }
}
