"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EventManagementTable } from "@/components/organizer/event-management-table"
import { Search, Plus, Filter } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { api, type Event as ApiEvent } from "@/lib/api"

export default function OrganizerEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadEvents = async () => {
      if (!user || !user._id) {
        console.error('My Events: User or user ID is missing', user)
        return
      }

      try {
        setLoading(true)
        const eventsRes = await api.getOrganizerEvents(user._id, { 
          limit: 100
        })
        
        // Debug: log the response
        if (process.env.NODE_ENV === 'development') {
          console.log('My Events API Response:', eventsRes)
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
        
        console.log(`My Events: Loaded ${myEvents.length} events`)
        setEvents(myEvents)
      } catch (error) {
        console.error("Failed to load events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user])

  const stats = {
    total: events.length,
    active: events.filter(e => e.status === 'published' && new Date(e.startTime) > new Date()).length,
    draft: events.filter(e => e.status === 'draft').length,
    completed: events.filter(e => e.status === 'published' && new Date(e.endTime) < new Date()).length
  }

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">My Events</h1>
                  <p className="text-muted-foreground">Manage and track all your events</p>
                </div>
                <Link href="/organizer/create">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <p className="text-2xl font-bold">{loading ? "..." : stats.total}</p>
                      </div>
                      <Badge variant="secondary">All Time</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Events</p>
                        <p className="text-2xl font-bold">{loading ? "..." : stats.active}</p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Live</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Draft Events</p>
                        <p className="text-2xl font-bold">{loading ? "..." : stats.draft}</p>
                      </div>
                      <Badge variant="secondary">Drafts</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">{loading ? "..." : stats.completed}</p>
                      </div>
                      <Badge variant="outline">Done</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>Search, filter, and manage your events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search events by title, date, or status..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Events Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>Complete list of your events with management options</CardDescription>
                </CardHeader>
                <CardContent>
                  <EventManagementTable events={events} loading={loading} searchTerm={searchTerm} onRefresh={() => {
                    if (user) {
                      setLoading(true)
                      api.getOrganizerEvents(user._id, { limit: 100 })
                        .then(res => setEvents(res.data || res.items || []))
                        .catch(err => console.error(err))
                        .finally(() => setLoading(false))
                    }
                  }} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
