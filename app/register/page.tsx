"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Download, ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"
import { StorageService } from "@/lib/storage"
import { generateRegistrationId, generateQRCodeData } from "@/lib/qr-generator"
import type { Registration } from "@/lib/types"
import QRCodeDisplay from "@/components/qr-code-display"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventName: "",
  })
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.eventName) {
        throw new Error("All fields are required")
      }

      // Check if email already registered
      const existingRegistration = StorageService.getRegistrationByEmail(formData.email)
      if (existingRegistration) {
        throw new Error("This email is already registered for the event")
      }

      // Generate registration
      const registrationId = generateRegistrationId()
      const qrCodeData = generateQRCodeData(registrationId)

      const newRegistration: Registration = {
        id: registrationId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        eventName: formData.eventName,
        qrCode: qrCodeData,
        registrationDate: new Date().toISOString(),
      }

      // Save registration
      StorageService.saveRegistration(newRegistration)
      setRegistration(newRegistration)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted py-12 animate-fade-in">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-scale-in">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in pulse-success">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Registration Successful!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Your QR code has been generated. Save it to mark your attendance at the event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-muted/50 p-6 rounded-xl border animate-slide-up">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Registration Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-muted-foreground">Name:</span>
                      <p className="font-semibold">{registration.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <p className="font-semibold">{registration.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-muted-foreground">Phone:</span>
                      <p className="font-semibold">{registration.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-muted-foreground">Event:</span>
                      <p className="font-semibold">{registration.eventName}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <span className="font-medium text-muted-foreground">Registration ID:</span>
                  <p className="font-mono text-sm bg-background px-3 py-1 rounded mt-1 inline-block">
                    {registration.id}
                  </p>
                </div>
              </div>

              <div className="text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-semibold text-xl mb-6">Your QR Code</h3>
                <div className="bg-background p-6 rounded-xl border-2 border-dashed border-primary/20 inline-block">
                  <QRCodeDisplay value={registration.qrCode} registrationId={registration.id} />
                </div>
              </div>

              <Alert className="border-primary/20 bg-primary/5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <CheckCircle className="w-4 h-4 text-primary" />
                <AlertDescription className="text-primary">
                  <strong>Important:</strong> Save this QR code and bring it to the event. You can screenshot this page
                  or download the QR code image.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <Button asChild variant="outline" className="flex-1 interactive-button border-2 bg-transparent">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <Button onClick={() => window.print()} className="flex-1 interactive-button gradient-bg">
                  <Download className="w-4 h-4 mr-2" />
                  Print QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-scale-in">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Event Registration</CardTitle>
            <CardDescription className="text-base">
              Fill out the form below to register for the event and receive your QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-12 bg-background border-2 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 bg-background border-2 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-12 bg-background border-2 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <Label htmlFor="eventName" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Event Name *
                </Label>
                <Input
                  id="eventName"
                  name="eventName"
                  type="text"
                  placeholder="Enter the event name"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className="h-12 bg-background border-2 focus:border-primary transition-colors"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="animate-scale-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 interactive-button gradient-bg text-lg font-semibold animate-slide-up"
                style={{ animationDelay: "0.5s" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Registering...
                  </div>
                ) : (
                  "Register & Generate QR Code"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: "0.6s" }}>
              <Button asChild variant="ghost" className="interactive-button">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
