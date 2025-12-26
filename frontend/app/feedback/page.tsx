"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Star, Calendar, MapPin, User, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type Registration } from "@/lib/api"

export default function FeedbackPage() {
  const { user } = useAuth()
  const [attendedEvents, setAttendedEvents] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const res = await api.myRegistrations({ limit: 50 })
        const now = new Date()

        const past = (res?.items ?? []).filter(r =>
          typeof r.eventId === "object" &&
          "endTime" in r.eventId &&
          new Date(r.eventId.endTime) < now
        )

        setAttendedEvents(past)
      } catch (err) {
        console.error("Failed to load attended events:", err)
        setAttendedEvents([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  const handleSubmitFeedback = async (eventId: string) => {
    try {
      await api.submitFeedback(eventId, { rating, comment })
      setSelectedEvent(null)
      setRating(0)
      setComment("")
    } catch (err) {
      console.error("Failed to submit feedback:", err)
    }
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />

        <div className="flex">
          <Sidebar role="student" />

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Event Feedback</h1>
                <p className="text-muted-foreground">
                  Share your experience and help improve future events
                </p>
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground py-8">
                  Loading attended events...
                </p>
              ) : attendedEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No attended events to review yet.
                </p>
              ) : (
                attendedEvents.map(registration => {
                  const event =
                    typeof registration.eventId === "object"
                      ? registration.eventId
                      : null
                  if (!event) return null

                  return (
                    <Card key={registration._id}>
                      <CardHeader>
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription className="space-y-1 mt-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.startTime).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4" />
                                {event.venue}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4" />
                                {typeof event.organizerId === "object"
                                  ? event.organizerId.name
                                  : "Unknown"}
                              </div>
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">Attended</Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {selectedEvent === event._id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Rate this event
                              </label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                  >
                                    <Star
                                      className={`h-6 w-6 ${
                                        star <= (hoveredStar || rating)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </button>
                                ))}
                                {rating > 0 && (
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    ({rating}/5)
                                  </span>
                                )}
                              </div>
                            </div>

                            <Textarea
                              placeholder="Share your thoughts about this event..."
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                            />

                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleSubmitFeedback(event._id)}
                                disabled={rating === 0}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Submit Feedback
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedEvent(null)
                                  setRating(0)
                                  setComment("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => setSelectedEvent(event._id)}>
                            <Star className="mr-2 h-4 w-4" />
                            Leave Feedback
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
