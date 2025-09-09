import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, QrCode, Users, BarChart3, Database } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted animate-fade-in">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 text-balance">
            Event Attendance System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Streamline your event management with QR code-based registration and attendance tracking. Experience
            seamless check-ins and real-time analytics.
          </p>
        </div>

        <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="interactive-button gradient-bg text-primary-foreground font-semibold px-8 py-6 text-lg"
            >
              <Link href="/register">
                <Calendar className="w-5 h-5 mr-2" />
                Register for Event
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="interactive-button border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg bg-transparent"
            >
              <Link href="/scanner">
                <QrCode className="w-5 h-5 mr-2" />
                Scan QR Code
              </Link>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="interactive-button text-muted-foreground hover:text-foreground px-8 py-6"
            >
              <Link href="/admin">
                <BarChart3 className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="interactive-button text-muted-foreground hover:text-foreground px-8 py-6"
            >
              <Link href="/seed-data">
                <Database className="w-5 h-5 mr-2" />
                Add Sample Data
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card
            className="text-center hover-lift border-0 bg-card/50 backdrop-blur-sm animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Easy Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Quick and simple event registration with instant QR code generation and email confirmations
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="text-center hover-lift border-0 bg-card/50 backdrop-blur-sm animate-scale-in"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-xl font-semibold">QR Code Scanning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Lightning-fast attendance marking using advanced QR code scanning with duplicate prevention
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="text-center hover-lift border-0 bg-card/50 backdrop-blur-sm animate-scale-in"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto bg-chart-2/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-chart-2" />
              </div>
              <CardTitle className="text-xl font-semibold">Real-time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Monitor attendance in real-time with live dashboard updates and instant notifications
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="text-center hover-lift border-0 bg-card/50 backdrop-blur-sm animate-scale-in"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto bg-chart-3/10 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-chart-3" />
              </div>
              <CardTitle className="text-xl font-semibold">Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Generate comprehensive reports and export data to Excel, CSV, or JSON formats
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="text-center hover-lift border-0 bg-card/50 backdrop-blur-sm animate-scale-in"
            style={{ animationDelay: "0.6s" }}
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mx-auto bg-muted-foreground/10 rounded-2xl flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-semibold">Sample Data</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Populate the system with realistic sample data to explore and test all features
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
