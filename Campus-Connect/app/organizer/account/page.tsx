"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  LogOut,
  Check,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function OrganizerAccountPage() {
  const { user, logout, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatarUrl: ""
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        avatarUrl: user.avatarUrl || ""
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setSuccessMessage("")
    setErrorMessage("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        avatarUrl: user.avatarUrl || ""
      })
    }
    setErrorMessage("")
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrorMessage("")
      setSuccessMessage("")

      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl
      })

      setSuccessMessage("Profile updated successfully!")
      setIsEditing(false)
      
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      setErrorMessage(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout()
    }
  }

  if (!user) return null

  const userInitials = user.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={{ name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account information and preferences</p>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Your personal details and contact information</CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={handleEdit} variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.avatarUrl} alt={user.name} />
                      <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label htmlFor="avatarUrl">Avatar URL</Label>
                          <Input
                            id="avatarUrl"
                            value={formData.avatarUrl}
                            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter a URL to your profile picture
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold">{user.name}</h3>
                          <Badge variant="secondary">{user.role}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid gap-4">
                    {/* Name */}
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Full Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-muted rounded-md">{user.name}</div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Address
                      </Label>
                      <div className="px-3 py-2 bg-muted rounded-md text-muted-foreground">
                        {user.email}
                        <span className="ml-2 text-xs">(Cannot be changed)</span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-muted rounded-md">
                          {(user as any).phone || "Not provided"}
                        </div>
                      )}
                    </div>

                    {/* Role */}
                    <div className="grid gap-2">
                      <Label className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Role
                      </Label>
                      <div className="px-3 py-2 bg-muted rounded-md capitalize">
                        {user.role}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="grid gap-2">
                      <Label className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Member Since
                      </Label>
                      <div className="px-3 py-2 bg-muted rounded-md">
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>Manage your account access</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleLogout} 
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
