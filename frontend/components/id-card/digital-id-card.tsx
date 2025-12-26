import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QRCodeDisplay } from "@/components/qr/qr-code-display"
import { School, Mail, Phone, Shield, Wifi, WifiOff, Clock } from "lucide-react"
import Image from "next/image"

interface StudentData {
  id: string
  name: string
  email: string
  phone: string
  program: string
  year: string
  status: string
  issueDate: string
  expiryDate: string
  photo: string | null
  qrData: string
  accessLevel: string
  lastVerified: string
}

interface DigitalIDCardProps {
  studentData: StudentData
  securityLevel: "basic" | "enhanced" | "maximum"
  isOnline: boolean
}

export function DigitalIDCard({ studentData, securityLevel, isOnline }: DigitalIDCardProps) {
  const getSecurityColor = () => {
    switch (securityLevel) {
      case "basic":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "enhanced":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "maximum":
        return "bg-green-500/10 text-green-500 border-green-500/20"
    }
  }

  return (
    <Card className="overflow-hidden relative">
      {/* Security Level Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className={getSecurityColor()}>
          <Shield className="h-3 w-3 mr-1" />
          {securityLevel.toUpperCase()}
        </Badge>
      </div>

      {/* University Header */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <School className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">University Student ID</h2>
              <p className="text-primary-foreground/80 text-sm">Official Digital Identification</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/80">Valid Until</p>
            <p className="font-bold">{studentData.expiryDate}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo and QR Section */}
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              {studentData.photo ? (
                <Image
                  src={studentData.photo}
                  alt={`${studentData.name} photo`}
                  fill
                  className="object-cover rounded-lg border-2 border-border shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-lg border-2 border-border shadow-md bg-primary/10 flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary">
                    {studentData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Status Indicator */}
              <div className="absolute -bottom-2 -right-2">
                <Badge
                  variant={studentData.status === "Active" ? "default" : "secondary"}
                  className={`${studentData.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""} text-xs`}
                >
                  {studentData.status}
                </Badge>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <QRCodeDisplay data={studentData.qrData} size={120} />
              <p className="text-xs text-muted-foreground">Scan for verification</p>
              <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isOnline ? "Live" : "Cached"}</span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{studentData.name}</h3>
                <p className="text-muted-foreground font-mono">ID: {studentData.id}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <School className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">{studentData.program}</p>
                    <p className="text-sm text-muted-foreground">{studentData.year}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{studentData.email}</p>
                    <p className="text-xs text-muted-foreground">University Email</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{studentData.phone}</p>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                </div>
              </div>
            </div>

            {/* Access Level and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Access Level</p>
                <Badge variant="outline" className="mt-1">
                  {studentData.accessLevel}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{studentData.issueDate}</p>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last verified:</span>
                <span className="font-medium">{new Date(studentData.lastVerified).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
