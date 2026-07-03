"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EventCard } from "@/components/events/event-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Calendar, Search, Filter, Ticket, Clock, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { api, type Event as ApiEvent, type Registration } from "@/lib/api"
import Link from "next/link"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load user's registrations
        const regsData = await api.myRegistrations({ limit: 10 })
        console.log('Dashboard Registrations API Response:', regsData)
        // API wrapper extracts 'data' field, so regsData is already an array
        const myRegs = Array.isArray(regsData) ? regsData : (regsData.data || regsData.items || [])
        console.log('Loaded registrations for dashboard:', myRegs)
        setMyRegistrations(myRegs)

        // Load upcoming events
        const eventsData = await api.listEvents({
          status: 'published',
          limit: 6
        })
        console.log('Dashboard Events API Response:', eventsData)
        const eventItems = eventsData.data || eventsData.items || []
        console.log(`Loaded ${eventItems.length} events for dashboard`)
        setUpcomingEvents(eventItems)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const registeredCount = myRegistrations.length
  const attendedCount = myRegistrations.filter(r => {
    if (r.eventId && typeof r.eventId === 'object' && 'endTime' in r.eventId) {
      return new Date(r.eventId.endTime) < new Date()
    }
    return false
  }).length
  const upcomingCount = myRegistrations.filter(r => {
    if (r.eventId && typeof r.eventId === 'object' && 'startTime' in r.eventId) {
      return new Date(r.eventId.startTime) > new Date()
    }
    return false
  }).length
  const nextEvent = upcomingEvents[0]

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="student" />
          <main className="flex-1 p-6">
            <div className="relative">
              <div className="pointer-events-none absolute -top-16 right-6 h-48 w-48 rounded-full bg-gradient-to-br from-amber-200/50 via-emerald-200/40 to-sky-200/50 blur-3xl" />
              <div className="pointer-events-none absolute left-0 top-40 h-56 w-56 rounded-full bg-gradient-to-br from-rose-200/40 via-purple-200/30 to-transparent blur-3xl" />
              <div className="max-w-7xl mx-auto space-y-8 relative">
                {/* Hero */}
                <div className="rounded-2xl border bg-gradient-to-br from-white via-white/95 to-emerald-50/60 p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Campus Pulse
                      </div>
                      <h1 className="text-4xl font-semibold leading-tight text-balance text-black">
                        Welcome back, {user?.name || "Student"}
                      </h1>
                      <p className="text-muted-foreground max-w-xl">
                        Pick your next experience. Track your passes, share feedback, and keep your campus calendar full.
                      </p>
                      {upcomingCount > 0 ? (
                        <Badge variant="secondary" className="w-fit">
                          {upcomingCount} upcoming {upcomingCount === 1 ? "event" : "events"}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link href="/events">
                        <Button className="bg-foreground text-background hover:bg-foreground/90">
                          Browse Events
                        </Button>
                      </Link>
                      <Link href="/my-events">
                        <Button variant="outline" className="bg-transparent">
                          View My Passes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard title="Registered Events" value={registeredCount.toString()} icon={Ticket} trend={`${registeredCount} total`} />
                    <StatsCard title="Attended Events" value={attendedCount.toString()} icon={Clock} trend={registeredCount > 0 ? `${Math.round((attendedCount / registeredCount) * 100)}% attendance rate` : "No events yet"} />
                    <StatsCard title="Upcoming Events" value={upcomingCount.toString()} icon={Calendar} trend={upcomingCount > 0 ? "Stay tuned!" : "Register now"} />
                  </div>

                  <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-white">Next Up</CardTitle>
                      <CardDescription className="text-white/70">Your closest event on the horizon</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {nextEvent ? (
                        <>
                          <div className="text-lg font-semibold">{nextEvent.title}</div>
                          <div className="text-sm text-white/70">
                            {new Date(nextEvent.startTime).toLocaleDateString()} • {nextEvent.location}
                          </div>
                          <Link href={`/events/${nextEvent._id}`}>
                            <Button className="bg-white text-slate-900 hover:bg-white/90">View Details</Button>
                          </Link>
                        </>
                      ) : (
                        <div className="text-sm text-white/70">No upcoming events yet. Browse to get started.</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/events">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Calendar className="mr-2 h-4 w-4" />
                          Browse Events
                        </Button>
                      </Link>
                      <Link href="/my-events">
                        <Button variant="outline" className="bg-transparent">
                          <Ticket className="mr-2 h-4 w-4" />
                          My Tickets
                        </Button>
                      </Link>
                      <Link href="/feedback">
                        <Button variant="outline" className="bg-transparent">
                          <Star className="mr-2 h-4 w-4" />
                          Leave Feedback
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

              {/* My Upcoming Events */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Upcoming Events</CardTitle>
                      <CardDescription>Events you've registered for</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent" asChild>
                      <a href="/my-events">View All</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                  ) : myRegistrations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No upcoming events yet. Browse events to get started!</p>
                  ) : (
                    <div className="space-y-4">
                      {myRegistrations.slice(0, 3).map((registration) => {
                        const event = typeof registration.eventId === 'object' ? registration.eventId : null
                        if (!event) return null

                        return (
                          <div
                            key={registration._id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.venue}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant={registration.status === "confirmed" ? "default" : "secondary"}>{registration.status}</Badge>
                              <Button size="sm" variant="outline" className="bg-transparent" asChild>
                                <a href={`/ticket/${registration._id}`}>View Ticket</a>
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Discover Events */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Discover Events</h2>
                    <p className="text-muted-foreground">Find events that match your interests</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search events..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline" size="icon" className="bg-transparent">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading events...</p>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No events available at the moment.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
