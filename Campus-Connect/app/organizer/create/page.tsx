"use client"

import type React from "react"
import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, Upload, Save, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"

export default function CreateEventPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("Please login to create an event")
      return
    }
    
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      
      const category = formData.get("category") as string
      const startTimeStr = formData.get("startTime") as string
      const endTimeStr = formData.get("endTime") as string
      
      // Convert datetime-local format to ISO 8601
      const startTime = startTimeStr ? new Date(startTimeStr).toISOString() : new Date().toISOString()
      const endTime = endTimeStr ? new Date(endTimeStr).toISOString() : new Date(Date.now() + 3600000).toISOString()

      await api.createEvent({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        location: formData.get("location") as string,
        venue: formData.get("venue") as string,
        category: category || "general",
        startTime,
        endTime,
        capacity: Number(formData.get("capacity")),
        isPaid,
        price: isPaid ? Number(formData.get("price")) : undefined,
        coverImage: imagePreview || undefined,
        status: "published",
      })

      alert("Event created successfully!")
      router.push("/organizer/events")
    } catch (error: any) {
      console.error("Failed to create event:", error)
      alert(error.message || "Failed to create event. Please make sure you're logged in and all required fields are filled.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl,
                }
              : undefined
          }
        />

        <div className="flex">
          <Sidebar role="organizer" />

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Create New Event</h1>
                  <p className="text-muted-foreground">
                    Fill in the details to create your event
                  </p>
                </div>
                <Badge variant="secondary">Draft</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential details about your event
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input id="title" name="title" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea id="description" name="description" rows={4} />
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Date & Location
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="datetime-local"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="datetime-local"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input id="venue" name="venue" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" />
                    </div>
                  </CardContent>
                </Card>

                {/* Capacity & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Capacity & Pricing
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Maximum Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min={1}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="paid-event"
                        checked={isPaid}
                        onCheckedChange={setIsPaid}
                      />
                      <Label htmlFor="paid-event">Paid Event</Label>
                    </div>

                    {isPaid && (
                      <div className="space-y-2">
                        <Label htmlFor="price">Ticket Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Event Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Event Image
                    </CardTitle>
                    <CardDescription>Upload a cover image for your event (visible to all students)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverImage">Cover Image</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          id="coverImage"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label htmlFor="coverImage" className="cursor-pointer block">
                          {imagePreview ? (
                            <div className="space-y-2">
                              <img
                                src={imagePreview}
                                alt="Event preview"
                                className="max-h-48 mx-auto rounded-lg object-cover"
                              />
                              <p className="text-sm text-muted-foreground">Click to change image</p>
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" type="button">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>

                  <div className="flex gap-3">
                    <Button variant="outline" type="button">
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
