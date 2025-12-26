"use client"

import { useEffect, useMemo, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Download, TrendingUp, MessageSquare, Users } from "lucide-react"
import { FeedbackChart } from "@/components/organizer/feedback-chart"
import { useAuth } from "@/lib/auth-context"
import { api, type Feedback } from "@/lib/api"

export default function FeedbackAnalytics() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadFeedback = async () => {
      try {
        setLoading(true)
        const res = await api.getOrganizerFeedback(user._id, { limit: 200 })
        setFeedback(res.items || res.data || [])
      } catch (err) {
        console.error("Failed to load feedback:", err)
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [user])

  /**
   * 🔹 Build event-level analytics from raw feedback
   */
  const eventFeedback = useMemo(() => {
    const map = new Map<string, any>()

    feedback.forEach((f) => {
      const event =
        typeof f.eventId === "object"
          ? f.eventId
          : { _id: f.eventId, title: "Unknown Event" }

      if (!map.has(event._id)) {
        map.set(event._id, {
          id: event._id,
          title: event.title,
          totalReviews: 0,
          totalRating: 0,
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recentComments: [],
        })
      }

      const e = map.get(event._id)
      e.totalReviews += 1
      e.totalRating += f.rating
      e.ratings[f.rating] += 1

      if (f.comment) {
        e.recentComments.push({
          user:
            typeof f.userId === "object"
              ? f.userId.name
              : "Anonymous",
          rating: f.rating,
          comment: f.comment,
        })
      }
    })

    return Array.from(map.values()).map((e) => ({
      ...e,
      averageRating:
        e.totalReviews > 0
          ? Number((e.totalRating / e.totalReviews).toFixed(1))
          : 0,
      recentComments: e.recentComments.slice(0, 3),
    }))
  }, [feedback])

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar
          user={
            user
              ? { name: user.name, email: user.email, role: user.role }
              : undefined
          }
        />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Feedback Analytics</h1>
                  <p className="text-muted-foreground">
                    Track event performance and attendee satisfaction
                  </p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>
                    Feedback summary across all events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FeedbackChart />
                </CardContent>
              </Card>

              {/* Event Feedback */}
              <div className="space-y-6">
                {loading ? (
                  <p className="text-muted-foreground">Loading feedback…</p>
                ) : eventFeedback.length === 0 ? (
                  <p className="text-muted-foreground">
                    No feedback received yet.
                  </p>
                ) : (
                  eventFeedback.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription>
                              {event.totalReviews} reviews • Avg{" "}
                              {event.averageRating}/5
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${
                                  s <= Math.round(event.averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Ratings */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Rating Breakdown
                            </h4>
                            {[5, 4, 3, 2, 1].map((r) => (
                              <div
                                key={r}
                                className="flex items-center space-x-3 text-sm"
                              >
                                <span className="w-8">{r}★</span>
                                <div className="flex-1 bg-muted h-2 rounded">
                                  <div
                                    className="bg-primary h-2 rounded"
                                    style={{
                                      width: `${
                                        event.totalReviews
                                          ? (event.ratings[r] /
                                              event.totalReviews) *
                                            100
                                          : 0
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="w-8 text-right">
                                  {event.ratings[r]}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Comments */}
                          <div>
                            <h4 className="font-medium mb-3">
                              Recent Comments
                            </h4>
                            {event.recentComments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No comments yet.
                              </p>
                            ) : (
                              event.recentComments.map(
                                (c: any, i: number) => (
                                  <div
                                    key={i}
                                    className="border rounded p-3 mb-2"
                                  >
                                    <div className="flex justify-between mb-1">
                                      <span className="font-medium text-sm">
                                        {c.user}
                                      </span>
                                      <span className="text-xs">
                                        {c.rating}★
                                      </span>
                                    </div>
                                    <p className="text-sm italic text-muted-foreground">
                                      “{c.comment}”
                                    </p>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
