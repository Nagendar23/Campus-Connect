"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Calendar, Plus, Users, DollarSign, TrendingUp, Star, QrCode } from "lucide-react"
import Link from "next/link"
import { RecentEventsTable } from "@/components/organizer/recent-events-table"
import { AnalyticsChart } from "@/components/organizer/analytics-chart"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { api, type Event as ApiEvent } from "@/lib/api"

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    revenue: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user._id) {
        console.error('Dashboard: User or user ID is missing', user)
        return
      }

      try {
        setLoading(true)
        // Load organizer's events
        const eventsRes = await api.getOrganizerEvents(user._id, { 
          limit: 50
        })
        
        // Debug: log the response
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard API Response:', eventsRes)
        }
        
        // Handle both response formats
        let myEvents: any[] = []
        if (eventsRes) {
          if (Array.isArray(eventsRes.data)) {
            myEvents = eventsRes.data
          } else if (Array.isArray(eventsRes.items)) {
            myEvents = eventsRes.items
          } else if (Array.isArray(eventsRes)) {
            myEvents = eventsRes
          }
        }
        
        console.log(`Dashboard: Loaded ${myEvents.length} events`)
        setEvents(myEvents)

        // Calculate stats
        const totalAttendees = myEvents.reduce((sum, e) => sum + (e.registeredCount || 0), 0)
        const revenue = myEvents.reduce((sum, e) => sum + ((e.price || 0) * (e.registeredCount || 0)), 0)

        // Load feedback for average rating
        let avgRating = 0
        try {
          const feedbackRes = await api.getOrganizerFeedback(user._id, { limit: 500 })
          const feedbackItems = feedbackRes.data || feedbackRes.items || []
          if (feedbackItems.length > 0) {
            const totalRating = feedbackItems.reduce((sum, f) => sum + f.rating, 0)
            avgRating = totalRating / feedbackItems.length
          }
        } catch (err) {
          console.error("Failed to load feedback:", err)
        }

        const newStats = {
          totalEvents: myEvents.length,
          totalAttendees,
          revenue,
          avgRating
        }
        
        setStats(newStats)
      } catch (error) {
        console.error("Failed to load organizer data:", error)
        // Set empty stats on error
        setStats({
          totalEvents: 0,
          totalAttendees: 0,
          revenue: 0,
          avgRating: 0
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-balance">Welcome back, {user?.name || 'Organizer'}!</h1>
                  <p className="text-muted-foreground">Manage your events and track performance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link href="/organizer/create">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard title="Total Events" value={loading ? "..." : String(stats.totalEvents)} icon={Calendar} trend={`${stats.totalEvents} created`} />
                <StatsCard title="Total Attendees" value={loading ? "..." : String(stats.totalAttendees)} icon={Users} trend="Across all events" />
                <StatsCard title="Revenue Generated" value={loading ? "..." : `$${stats.revenue}`} icon={DollarSign} trend="Total earnings" />
                <StatsCard title="Average Rating" value={loading ? "..." : stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "0.0"} icon={Star} trend="Based on feedback" />
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common organizer tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/organizer/create">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Event
                      </Button>
                    </Link>
                    <Link href="/organizer/scanner">
                      <Button variant="outline" className="bg-transparent">
                        <QrCode className="mr-2 h-4 w-4" />
                        QR Scanner
                      </Button>
                    </Link>
                    <Link href="/organizer/analytics">
                      <Button variant="outline" className="bg-transparent">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Analytics
                      </Button>
                    </Link>
                    <Link href="/organizer/attendees">
                      <Button variant="outline" className="bg-transparent">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Attendees
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Registration Trends</CardTitle>
                  <CardDescription>Event registrations over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart events={events} />
                </CardContent>
              </Card>

              {/* Recent Events Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Events</CardTitle>
                      <CardDescription>Overview of your latest events and their performance</CardDescription>
                    </div>
                    <Link href="/organizer/events">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        View All Events
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <RecentEventsTable events={events} loading={loading} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
