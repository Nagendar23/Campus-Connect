"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeDisplay } from "@/components/qr/qr-code-display"
import { DigitalIDCard } from "@/components/id-card/digital-id-card"
import { IDCardSettings } from "@/components/id-card/id-card-settings"
import {
  Download,
  Share2,
  Award as IdCard,
  Phone,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Nfc,
  LogOut,
  Edit,
  Save,
  X,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"

/* ---------- helpers ---------- */

// always return a safe user identifier
const getUserIdentifier = (user: any) => {
  return (user?._id || user?.id || user?.email || "UNKNOWN").toString()
}

// Generate QR data for user
const generateQRData = (user: any) => {
  const uid = getUserIdentifier(user)
  const expiry = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0]

  return `STUDENT|${uid}|${user.email}|${expiry}`
}

export default function DigitalIDPage() {
  const { user, logout, updateProfile } = useAuth()
  const [isOnline, setIsOnline] = useState(true)
  const [nfcSupported, setNfcSupported] = useState(false)
  const [lastSync, setLastSync] = useState(new Date())
  const [securityLevel, setSecurityLevel] =
    useState<"basic" | "enhanced" | "maximum">("enhanced")
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  // Check URL parameter for edit mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('edit') === 'true') {
        setIsEditing(true)
      }
    }
  }, [])

  if (!user) return null

  const userIdentifier = getUserIdentifier(user)

  const studentData = {
    id: userIdentifier.slice(-6).toUpperCase(),
    name: user.name,
    email: user.email,
    phone: (user as any).phone || "+1 (555) 000-0000",
    program: (user as any).program || "Computer Science",
    year: (user as any).year || "Senior",
    status: "Active",
    issueDate: new Date(user.createdAt || Date.now())
      .toISOString()
      .split("T")[0],
    expiryDate: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
    photo: user.avatarUrl || null,
    qrData: generateQRData(user),
    emergencyContact: {
      name: "Emergency Contact",
      phone: "+1 (555) 000-0000",
      relationship: "Family",
    },
    medicalInfo: {
      bloodType: "O+",
      allergies: [] as string[],
      medications: [] as string[],
    },
    accessLevel: "Standard",
    lastVerified: new Date().toISOString(),
  }

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditForm({
        name: user.name,
        email: user.email,
        phone: (user as any).phone || ""
      })
    }
  }, [isEditing, user])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    if ("NDEFReader" in window) {
      setNfcSupported(true)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleDownload = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 800
    canvas.height = 500

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    ctx.fillStyle = "#000000"
    ctx.font = "bold 24px Arial"
    ctx.fillText("University Student ID", 50, 60)

    ctx.font = "18px Arial"
    ctx.fillText(`Name: ${studentData.name}`, 50, 120)
    ctx.fillText(`ID: ${studentData.id}`, 50, 150)
    ctx.fillText(`Program: ${studentData.program}`, 50, 180)
    ctx.fillText(`Year: ${studentData.year}`, 50, 210)

    const link = document.createElement("a")
    link.download = `student-id-${studentData.id}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My Digital Student ID",
        text: `Digital Student ID for ${studentData.name}`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("ID card link copied to clipboard!")
    }
  }

  const handleNFCWrite = async () => {
    if (!("NDEFReader" in window)) return

    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.write({
        records: [
          {
            recordType: "text",
            data: JSON.stringify({
              id: studentData.id,
              name: studentData.name,
              email: studentData.email,
              expiry: studentData.expiryDate,
            }),
          },
        ],
      })
      alert("NFC tag written successfully!")
    } catch {
      alert("Failed to write NFC tag")
    }
  }

  const isExpiringSoon = () => {
    const expiry = new Date(studentData.expiryDate)
    const soon = new Date()
    soon.setDate(soon.getDate() + 30)
    return expiry <= soon
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    try {
      setIsSaving(true)
      await updateProfile(editForm)
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout()
    }
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />

        <div className="flex">
          <Sidebar role="student" />

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IdCard className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-3xl font-bold">Digital Student ID</h1>
                    <p className="text-muted-foreground">
                      Secure digital identification
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  
                  <Badge variant={isOnline ? "default" : "secondary"}>
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    <span className="ml-1">{isOnline ? "Online" : "Offline"}</span>
                  </Badge>

                  <Badge className="bg-green-500/10 text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>

              {isExpiringSoon() && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your ID expires on {studentData.expiryDate}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="id-card">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="id-card">ID Card</TabsTrigger>
                  <TabsTrigger value="verification">QR Code</TabsTrigger>
                  <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="id-card" className="space-y-6">
                  <DigitalIDCard
                    studentData={studentData}
                    securityLevel={securityLevel}
                    isOnline={isOnline}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    {nfcSupported && (
                      <Button variant="outline" onClick={handleNFCWrite}>
                        <Nfc className="mr-2 h-4 w-4" />
                        Write NFC
                      </Button>
                    )}
                    <Button variant="outline">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Add to Wallet
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>QR Code Verification</CardTitle>
                      <CardDescription>
                        Scan this QR code to verify your identity at campus events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                      <QRCodeDisplay data={studentData.qrData} size={250} />
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium">{studentData.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {studentData.id}</p>
                        <p className="text-xs text-muted-foreground">Valid until: {studentData.expiryDate}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Profile</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          {studentData.photo ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                              <img
                                src={studentData.photo}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                              <span className="text-4xl font-bold text-primary">
                                {studentData.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {studentData.photo ? "Profile picture" : "No profile picture - showing initial"}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={isEditing ? editForm.name : studentData.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={isEditing ? editForm.email : studentData.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Contact Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={isEditing ? editForm.phone : studentData.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            disabled={!isEditing}
                            placeholder="+1 (555) 000-0000"
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>

                        <div className="flex items-center space-x-3 pt-4">
                          {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Profile
                            </Button>
                          ) : (
                            <>
                              <Button 
                                onClick={handleSaveProfile} 
                                disabled={isSaving}
                                className="flex-1"
                              >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Changes"}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="flex-1"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <IDCardSettings
                    securityLevel={securityLevel}
                    onSecurityLevelChange={setSecurityLevel}
                    nfcSupported={nfcSupported}
                  />
                </TabsContent>
              </Tabs>

              <div className="text-center text-sm text-muted-foreground">
                Security Level: {securityLevel.toUpperCase()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
