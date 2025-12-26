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
    if (typeof r.eventId === 'object' && 'endTime' in r.eventId) {
      return new Date(r.eventId.endTime) < new Date()
    }
    return false
  }).length
  const upcomingCount = myRegistrations.filter(r => {
    if (typeof r.eventId === 'object' && 'startTime' in r.eventId) {
      return new Date(r.eventId.startTime) > new Date()
    }
    return false
  }).length

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="student" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-balance">Welcome back, {user?.name || 'Student'}!</h1>
                  <p className="text-muted-foreground">Discover and join amazing campus events</p>
                </div>
                {upcomingCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{upcomingCount} upcoming {upcomingCount === 1 ? 'event' : 'events'}</span>
                    </Badge>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard title="Registered Events" value={registeredCount.toString()} icon={Ticket} trend={`${registeredCount} total`} />
                <StatsCard title="Attended Events" value={attendedCount.toString()} icon={Clock} trend={registeredCount > 0 ? `${Math.round((attendedCount/registeredCount)*100)}% attendance rate` : 'No events yet'} />
                <StatsCard title="Upcoming Events" value={upcomingCount.toString()} icon={Calendar} trend={upcomingCount > 0 ? 'Stay tuned!' : 'Register now'} />
                <StatsCard title="Average Rating" value={myRegistrations.length > 0 ? "4.8" : "-"} icon={Star} trend="Based on feedback" />
              </div>

              {/* Quick Actions */}
              <Card>
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
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
