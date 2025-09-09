export class ApiClient {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      }
    }
  }

  // Registration methods
  static async createRegistration(registrationData) {
    return this.request("/api/registrations", {
      method: "POST",
      body: JSON.stringify(registrationData),
    })
  }

  static async getRegistrations() {
    return this.request("/api/registrations")
  }

  static async getRegistration(id) {
    return this.request(`/api/registrations/${id}`)
  }

  // Attendance methods
  static async markAttendance(registrationId, scannedBy) {
    return this.request("/api/attendance", {
      method: "POST",
      body: JSON.stringify({ registrationId, scannedBy }),
    })
  }

  static async getAttendance() {
    return this.request("/api/attendance")
  }

  // Statistics
  static async getStats() {
    return this.request("/api/stats")
  }

  // Export
  static async exportData(options = {}) {
    try {
      const params = new URLSearchParams()

      if (options.format) params.append("format", options.format)
      if (options.event) params.append("event", options.event)
      if (options.status) params.append("status", options.status)

      const queryString = params.toString()
      const url = `/api/export${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const contentDisposition = response.headers.get("content-disposition")
        let filename = `event-attendance-${new Date().toISOString().split("T")[0]}.csv`

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }
}
