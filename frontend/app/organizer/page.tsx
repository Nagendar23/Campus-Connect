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
    let mounted = true
    const loadData = async () => {
      // If no user yet (loading), or user has no ID yet, wait.
      // But if we have a user object but no ID, that's an issue. 
      // Assuming valid user always has _id.
      if (!user?._id) return

      try {
        setLoading(true)
        // Load organizer's events
        const eventsRes = await api.getOrganizerEvents(user._id, {
          limit: 50
        })

        if (!mounted) return

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
          if (mounted) {
            const feedbackItems = feedbackRes.data || feedbackRes.items || []
            if (feedbackItems.length > 0) {
              const totalRating = feedbackItems.reduce((sum, f) => sum + f.rating, 0)
              avgRating = totalRating / feedbackItems.length
            }
          }
        } catch (err) {
          console.error("Failed to load feedback:", err)
        }

        if (mounted) {
          setStats({
            totalEvents: myEvents.length,
            totalAttendees,
            revenue,
            avgRating
          })
        }
      } catch (error) {
        console.error("Failed to load organizer data:", error)
        if (mounted) {
          setStats({
            totalEvents: 0,
            totalAttendees: 0,
            revenue: 0,
            avgRating: 0
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [user?._id]) // Depend explicitly on user._id to trigger when it becomes available

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="relative">
              <div className="pointer-events-none absolute -top-16 right-10 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200/50 via-emerald-200/40 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute left-10 top-48 h-64 w-64 rounded-full bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-transparent blur-3xl" />
              <div className="max-w-7xl mx-auto space-y-8 relative">
                {/* Hero */}
                <div className="rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-[0.3em] text-white/60">Organizer Console</div>
                      <h1 className="text-4xl font-semibold leading-tight">{user?.name || "Organizer"} Command Deck</h1>
                      <p className="text-white/70 max-w-xl">
                        Ship new events, watch attendance climb, and keep sponsors and volunteers aligned in one place.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link href="/organizer/create">
                        <Button className="bg-white text-slate-900 hover:bg-white/90">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Event
                        </Button>
                      </Link>
                      <Link href="/organizer/analytics">
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Open Analytics
                        </Button>
                      </Link>
                    </div>
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
                <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
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
                      <Link href="/organizer/volunteers">
                        <Button variant="outline" className="bg-transparent">
                          <Users className="mr-2 h-4 w-4" />
                          Volunteer Hiring
                        </Button>
                      </Link>
                      <Link href="/organizer/sponsors">
                        <Button variant="outline" className="bg-transparent">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Sponsors
                        </Button>
                      </Link>
                      <Link href="/organizer/budget">
                        <Button variant="outline" className="bg-transparent">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Budget
                        </Button>
                      </Link>
                      <Link href="/organizer/certificates">
                        <Button variant="outline" className="bg-transparent">
                          <Star className="mr-2 h-4 w-4" />
                          Certificates
                        </Button>
                      </Link>
                      <Link href="/organizer/communication">
                        <Button variant="outline" className="bg-transparent">
                          <Star className="mr-2 h-4 w-4" />
                          Communication
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
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
