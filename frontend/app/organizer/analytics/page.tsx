"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/organizer/analytics-chart"
import { AttendanceChart } from "@/components/organizer/attendance-chart"
import { RevenueChart } from "@/components/organizer/revenue-chart"
import { FeedbackChart } from "@/components/organizer/feedback-chart"
import { EventPerformanceTable } from "@/components/organizer/event-performance-table"
import { TrendingUp, Users, DollarSign, Star, Calendar, Download, BarChart3, PieChart, Activity } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api, type Event as ApiEvent, type OrganizerAnalytics } from "@/lib/api"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("6months")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [analytics, setAnalytics] = useState<OrganizerAnalytics | null>(null)
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        setLoading(true)
        // Load organizer's events
        const eventsRes = await api.getOrganizerEvents(user._id, { 
          limit: 100
        })
        setEvents(eventsRes.data || [])

        // Load analytics
        const analyticsData = await api.getOrganizerAnalytics(user._id)
        setAnalytics(analyticsData)
        
        // Load feedback to calculate average rating
        try {
          const feedbackRes = await api.getOrganizerFeedback(user._id, { limit: 500 })
          const feedbackItems = feedbackRes.data || feedbackRes.items || []
          if (feedbackItems.length > 0) {
            const totalRating = feedbackItems.reduce((sum, f) => sum + f.rating, 0)
            setAverageRating(totalRating / feedbackItems.length)
          }
        } catch (err) {
          console.error("Failed to load feedback:", err)
        }
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Calculate event categories distribution
  const eventCategories = events.reduce((acc, event) => {
    const category = event.category || 'Other'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalEventsCount = events.length || 1
  const categoryPercentages = Object.entries(eventCategories).map(([category, count]) => ({
    category,
    percentage: ((count / totalEventsCount) * 100).toFixed(1)
  })).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))

  // Calculate top performing events
  // Note: registeredCount and other metrics would come from backend
  const topEvents = events
    .map(event => ({
      name: event.title,
      attendees: 0, // Would need check-in data from backend
      rating: 0, // Would need feedback data from backend
      revenue: event.isPaid && event.price ? event.price * 0 : 0, // registeredCount * price
      id: event._id
    }))
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 3)

  const stats = {
    totalRevenue: analytics?.totalRevenue || 0,
    totalAttendees: analytics?.totalAttendees || 0,
    averageRating: averageRating || 0,
    totalEvents: analytics?.totalEvents || 0,
    conversionRate: analytics?.checkInRate || 0,
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
                  <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
                  <p className="text-muted-foreground">Comprehensive insights into your event performance</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="all">All Events</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          {loading ? "..." : `$${(stats.totalRevenue / 100).toLocaleString()}`}
                        </p>
                        <p className="text-xs text-muted-foreground">From all events</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Attendees</p>
                        <p className="text-2xl font-bold">
                          {loading ? "..." : stats.totalAttendees.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Checked in</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                        <p className="text-2xl font-bold">
                          {loading ? "..." : stats.averageRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">From feedback</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <p className="text-2xl font-bold">{loading ? "..." : stats.totalEvents}</p>
                        <p className="text-xs text-muted-foreground">All time</p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Rate</p>
                        <p className="text-2xl font-bold">
                          {loading ? "..." : `${stats.conversionRate.toFixed(1)}%`}
                        </p>
                        <p className="text-xs text-muted-foreground">Attendance rate</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Registration Trends</span>
                        </CardTitle>
                        <CardDescription>Event registrations over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AnalyticsChart />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <PieChart className="h-5 w-5" />
                          <span>Event Categories</span>
                        </CardTitle>
                        <CardDescription>Distribution of events by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {loading ? (
                            <p className="text-center text-muted-foreground py-4">Loading...</p>
                          ) : categoryPercentages.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No events yet</p>
                          ) : (
                            categoryPercentages.slice(0, 5).map((item, index) => {
                              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                              return (
                                <div key={item.category} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                                    <span className="text-sm capitalize">{item.category}</span>
                                  </div>
                                  <span className="text-sm font-medium">{item.percentage}%</span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Events</CardTitle>
                      <CardDescription>Events with highest attendance and ratings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {loading ? (
                          <p className="text-center text-muted-foreground py-4">Loading...</p>
                        ) : events.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">No events created yet</p>
                        ) : (
                          events.slice(0, 3).map((event) => (
                            <div
                              key={event._id}
                              className="flex items-center justify-between p-4 border border-border rounded-lg"
                            >
                              <div>
                                <h4 className="font-semibold">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(event.startTime).toLocaleDateString()} • {event.category || 'Event'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {event.isPaid && event.price ? `$${event.price.toFixed(2)}` : 'Free'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Max: {event.capacity} attendees
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Patterns</CardTitle>
                        <CardDescription>Check-in rates and attendance trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AttendanceChart />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Peak Hours</CardTitle>
                        <CardDescription>Most popular check-in times</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { time: "9:00 AM", percentage: 85 },
                            { time: "10:00 AM", percentage: 92 },
                            { time: "11:00 AM", percentage: 78 },
                            { time: "2:00 PM", percentage: 65 },
                            { time: "3:00 PM", percentage: 58 },
                          ].map((hour, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{hour.time}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${hour.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-muted-foreground w-8">{hour.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Analytics</CardTitle>
                      <CardDescription>Revenue trends and payment insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RevenueChart />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Feedback Analytics</CardTitle>
                      <CardDescription>Attendee satisfaction and feedback trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FeedbackChart />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Performance Comparison</CardTitle>
                      <CardDescription>Detailed performance metrics for all events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EventPerformanceTable />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
