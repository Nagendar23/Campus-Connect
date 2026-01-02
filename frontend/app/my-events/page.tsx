"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, QrCode, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { api, type Registration } from "@/lib/api"

export default function MyEventsPage() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.myRegistrations({ limit: 50 })
        console.log('My Registrations API Response:', res)

        // API wrapper extracts 'data' field, so res is already an array
        const registrationItems = Array.isArray(res) ? res : (res?.data || res?.items || [])
        console.log('Loaded registrations:', registrationItems)
        setRegistrations(registrationItems)
      } catch (error) {
        console.error("Failed to load registrations:", error)
        setRegistrations([])
      } finally {
        setLoading(false)
      }
    }

    if (user) load()
  }, [user])

  const now = new Date()

  const upcomingEvents = registrations.filter(r =>
    r.eventId && typeof r.eventId === "object" &&
    "startTime" in r.eventId &&
    new Date(r.eventId.startTime) > now
  )

  const pastEvents = registrations.filter(r =>
    r.eventId && typeof r.eventId === "object" &&
    "endTime" in r.eventId &&
    new Date(r.eventId.startTime) < now
  )

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />

        <div className="flex">
          <Sidebar role="student" />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">My Events</h1>
                <p className="text-muted-foreground">
                  Manage your registered events and view past attendance
                </p>
              </div>

              <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastEvents.length})
                  </TabsTrigger>
                </TabsList>

                {/* Upcoming */}
                <TabsContent value="upcoming" className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                  ) : upcomingEvents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No upcoming events. Browse events to register!
                    </p>
                  ) : (
                    upcomingEvents.map(registration => {
                      const event = typeof registration.eventId === "object" ? registration.eventId : null
                      if (!event) return null

                      return (
                        <Card key={registration._id}>
                          <CardHeader>
                            <div className="flex justify-between">
                              <div>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>
                                  Organized by{" "}
                                  {typeof event.organizerId === "object"
                                    ? event.organizerId.name
                                    : "Unknown"}
                                </CardDescription>
                              </div>
                              <Badge>{registration.status}</Badge>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(event.startTime).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {event.venue}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Button asChild>
                                  <a href={`/ticket/${registration._id}`}>
                                    <QrCode className="mr-2 h-4 w-4" />
                                    View QR Ticket
                                  </a>
                                </Button>
                                <Button variant="outline" asChild>
                                  <a href={`/events/${event._id}`}>Event Details</a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>

                {/* Past */}
                <TabsContent value="past" className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                  ) : pastEvents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No past events yet.
                    </p>
                  ) : (
                    pastEvents.map(registration => {
                      const event = typeof registration.eventId === "object" ? registration.eventId : null
                      if (!event) return null

                      return (
                        <Card key={registration._id}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>
                                  Organized by{" "}
                                  {typeof event.organizerId === "object"
                                    ? event.organizerId.name
                                    : "Unknown"}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-muted-foreground" />
                                  ))}
                                </div>
                                <Badge variant="secondary">attended</Badge>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(event.startTime).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {event.venue}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Button variant="outline" asChild>
                                  <a href={`/events/${event._id}`}>View Event Details</a>
                                </Button>
                                <Button variant="outline" asChild>
                                  <a href={`/feedback?event=${event._id}`}>
                                    <Star className="mr-2 h-4 w-4" />
                                    Leave Feedback
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
