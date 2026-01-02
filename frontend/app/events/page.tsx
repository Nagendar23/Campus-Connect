"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/events/event-card"
import { Search, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { api, type Event as ApiEvent } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | undefined>()
  const [price, setPrice] = useState<"free" | "paid" | undefined>()
  const [date, setDate] = useState<string | undefined>()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.listEvents({
          search: query,
          page: 1,
          limit: 50,
        })

        console.log('All Events API Response:', res)

        // Handle both response formats
        const items = Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.items) ? res.items : []
        const totalCount = res?.meta?.total || res?.total || items.length

        console.log(`Loaded ${items.length} events for students`)
        setEvents(items)
        setTotal(totalCount)
      } catch (error) {
        console.error("Failed to load events:", error)
        setEvents([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [query, category, price, date])

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />

        <div className="flex">
          <Sidebar role="student" />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">All Events</h1>
                  <p className="text-muted-foreground">
                    Discover and register for campus events
                  </p>
                </div>

                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {loading ? "Loading..." : `${total} events available`}
                  </span>
                </Badge>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Find Events</CardTitle>
                  <CardDescription>
                    Search and filter events to find what interests you
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events by title, description, or organizer..."
                        className="pl-10"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>

                    <Select onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select onValueChange={(v) => setPrice(v === "all" ? undefined : (v as any))}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select onValueChange={(v) => setDate(v === "all" ? undefined : v)}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="next-week">Next Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">Loading events...</p>
                  </div>
                )}

                {!loading && events.length > 0 &&
                  events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}

                {!loading && events.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      {query ? 'Try adjusting your search filters' : 'Check back later for upcoming events'}
                    </p>
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
