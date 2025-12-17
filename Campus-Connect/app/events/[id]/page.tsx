"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, DollarSign, Star, Share2, Heart } from "lucide-react"
import Image from "next/image"
import { RegistrationModal } from "@/components/events/registration-modal"
import { useParams, useRouter } from "next/navigation"
import { api, type Event as ApiEvent } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function EventDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const [eventData, setEventData] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.getEvent(id)
        // Handle response format: { data: event } or direct event
        const e = (response as any).data || response
        console.log('Event Details:', e)
        setEventData(e)
        
        // Check if user is already registered
        try {
          const registrations = await api.myRegistrations({ limit: 100 })
          console.log('My Registrations Response:', registrations)
          // API wrapper extracts 'data' field, so registrations is already an array
          const userRegistrations = Array.isArray(registrations) ? registrations : (registrations.data || registrations.items || [])
          console.log('User registrations:', userRegistrations)
          console.log('Looking for event ID:', id)
          
          const existingReg = userRegistrations.find((reg: any) => {
            const regEventId = typeof reg.eventId === 'object' ? reg.eventId._id : reg.eventId
            console.log('Comparing:', regEventId, 'with', id)
            return regEventId === id
          })
          
          if (existingReg) {
            console.log('Found existing registration:', existingReg)
            setIsRegistered(true)
            setRegistrationId(existingReg._id)
          } else {
            console.log('No existing registration found')
          }
        } catch (error) {
          console.error('Failed to check registration status:', error)
        }
      } catch (error) {
        console.error('Failed to load event:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user])

  const registered = eventData?.registeredCount || 0
  const spotsLeft = eventData ? eventData.capacity - registered : 0
  const isAlmostFull = eventData ? spotsLeft <= eventData.capacity * 0.1 : false
  const isFull = eventData ? spotsLeft <= 0 : false

  const handleRegistration = async () => {
    if (!eventData) return
    
    try {
      // If paid event, open payment modal
      if (eventData.isPaid && eventData.price && eventData.price > 0) {
        setIsRegistrationOpen(true)
      } else {
        // Free event - register directly
        const result = await api.registerForEvent(eventData._id)
        const registration = (result as any).data || result
        setRegistrationId(registration._id)
        setIsRegistered(true)
        
        // Refresh event data to get updated registration count
        const response = await api.getEvent(id)
        const e = (response as any).data || response
        setEventData(e)
        
        alert('Successfully registered for the event!')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      alert('Failed to register. Please try again.')
    }
  }

  const handleRegistrationSuccess = async (regId: string) => {
    setRegistrationId(regId)
    setIsRegistered(true)
    setIsRegistrationOpen(false)
    
    // Refresh event data to get updated registration count
    try {
      const response = await api.getEvent(id)
      const e = (response as any).data || response
      setEventData(e)
    } catch (error) {
      console.error('Failed to refresh event data:', error)
    }
  }

  if (loading || !eventData) {
    return (
      <AuthGuard requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar user={user || undefined} />
          <div className="flex">
            <Sidebar role={user?.role || "student"} />
            <main className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="h-64 rounded-lg bg-muted animate-pulse" />
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Format date and time
  const startDate = new Date(eventData.startTime)
  const endDate = new Date(eventData.endTime)
  const formattedDate = startDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
  const formattedStartTime = startDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  const formattedEndTime = endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })

  // Get organizer name
  const organizerName = typeof eventData.organizerId === 'object' && eventData.organizerId 
    ? eventData.organizerId.name 
    : 'Campus Events'

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user || undefined} />
        <div className="flex">
          <Sidebar role={user?.role || "student"} />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Event Header */}
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={eventData.coverImage || "/placeholder.svg"}
                  alt={eventData.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {eventData.category && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 capitalize">
                        {eventData.category}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 capitalize">
                      {eventData.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white text-balance">{eventData.title}</h1>
                  <p className="text-white/90 mt-2">Organized by {organizerName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Event Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{formattedDate}</p>
                            <p className="text-sm text-muted-foreground">
                              {formattedStartTime} - {formattedEndTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{eventData.venue || eventData.location}</p>
                            <p className="text-sm text-muted-foreground">{eventData.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {registered}/{eventData.capacity} registered
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {spotsLeft} spots remaining
                              {isAlmostFull && <span className="text-orange-500 ml-1">(Almost full!)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {!eventData.isPaid || !eventData.price ? "Free Event" : `$${eventData.price}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {!eventData.isPaid || !eventData.price ? "No cost to attend" : "Per person"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {eventData.description?.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4 last:mb-0 text-foreground">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Organizer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Organizer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{eventData.organizer}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">4.8</span>
                          <span className="text-sm text-muted-foreground">(156 reviews)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Registration Card */}
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Registration</span>
                        {eventData.price === 0 ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Free</Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary border-primary/20">${eventData.price}</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{isFull ? "Event is full" : `${spotsLeft} spots remaining`}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Registration Progress</span>
                          <span>{Math.round((eventData.registered / eventData.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${(eventData.registered / eventData.capacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {isRegistered ? (
                          <div className="text-center space-y-3">
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">✓ Registered</Badge>
                            <p className="text-sm text-muted-foreground">
                              You're registered for this event! Check your email for confirmation.
                            </p>
                            <Button 
                              variant="outline" 
                              className="w-full bg-transparent"
                              onClick={() => registrationId && router.push(`/ticket/${registrationId}`)}
                            >
                              View My Ticket
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={handleRegistration}
                            disabled={isFull}
                          >
                            {isFull ? "Event Full" : eventData.price === 0 ? "Register for Free" : "Register & Pay"}
                          </Button>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-transparent"
                            onClick={() => setIsFavorited(!isFavorited)}
                          >
                            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                          </Button>
                          <Button variant="outline" size="icon" className="bg-transparent">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline">Technology</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span>—</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Language</span>
                        <span>English</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Age Requirement</span>
                        <span>18+</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onSuccess={handleRegistrationSuccess}
        event={eventData}
      />
    </AuthGuard>
  )
}
