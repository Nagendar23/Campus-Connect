"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
  api,
  type Volunteer,
  type VolunteerApplication,
  type VolunteerAssignment,
  type Event as ApiEvent,
} from "@/lib/api"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OrganizerVolunteersPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("")
  const [selectedEventId, setSelectedEventId] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [assignmentStatus, setAssignmentStatus] = useState("assigned")
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadVolunteerData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [apps, assigns, vols, eventsRes] = await Promise.all([
          api.listVolunteerApplications(),
          api.listVolunteerAssignments(),
          api.listVolunteers(),
          user?._id ? api.getOrganizerEvents(user._id, { limit: 100 }) : Promise.resolve({ data: [] }),
        ])
        if (mounted) {
          setApplications(apps)
          setAssignments(assigns)
          setVolunteers(vols)
          const list = Array.isArray(eventsRes?.data) ? eventsRes.data : Array.isArray(eventsRes?.items) ? eventsRes.items : []
          setEvents(list)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load volunteer data")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadVolunteerData()

    return () => {
      mounted = false
    }
  }, [user?._id])

  const assignmentOptions = useMemo(() => {
    return {
      volunteerCount: volunteers.length,
      eventCount: events.length,
    }
  }, [volunteers.length, events.length])

  const createAssignment = async () => {
    if (!selectedVolunteerId || !selectedEventId) {
      setNotice("Select a volunteer and event to assign.")
      return
    }
    try {
      const newAssignment = await api.createVolunteerAssignment({
        volunteerId: selectedVolunteerId,
        eventId: selectedEventId,
        roleTitle: roleTitle.trim() || undefined,
        status: assignmentStatus as any,
      })
      setAssignments((current) => [newAssignment, ...current])
      setNotice("Volunteer assigned successfully.")
      setRoleTitle("")
    } catch (err: any) {
      setNotice(err?.message || "Failed to create assignment.")
    }
  }

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Volunteer Hiring</h1>
                <p className="text-muted-foreground">Manage volunteer applications and assign tasks</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Matching</CardTitle>
                  <CardDescription>Match volunteers to open tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading volunteer activity...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="rounded-md border p-3">
                          <p className="text-sm text-muted-foreground">Applications</p>
                          <p className="text-2xl font-semibold">{applications.length}</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-sm text-muted-foreground">Assignments</p>
                          <p className="text-2xl font-semibold">{assignments.length}</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-sm text-muted-foreground">Volunteers</p>
                          <p className="text-2xl font-semibold">{assignmentOptions.volunteerCount}</p>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-sm text-muted-foreground">Events</p>
                          <p className="text-2xl font-semibold">{assignmentOptions.eventCount}</p>
                        </div>
                      </div>

                      <div className="rounded-md border p-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Volunteer</Label>
                            <Select value={selectedVolunteerId} onValueChange={setSelectedVolunteerId}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select volunteer" />
                              </SelectTrigger>
                              <SelectContent>
                                {volunteers.map((vol) => {
                                  const name = typeof vol.userId === "object" && vol.userId ? vol.userId.name : vol._id
                                  return (
                                    <SelectItem key={vol._id} value={vol._id}>
                                      {name}
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Event</Label>
                            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select event" />
                              </SelectTrigger>
                              <SelectContent>
                                {events.map((evt) => (
                                  <SelectItem key={evt._id} value={evt._id}>
                                    {evt.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Role Title</Label>
                            <Input
                              value={roleTitle}
                              onChange={(e) => setRoleTitle(e.target.value)}
                              placeholder="Check-in desk"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={assignmentStatus} onValueChange={setAssignmentStatus}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button onClick={createAssignment}>Assign Volunteer</Button>
                        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
                      </div>

                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground mb-3">Recent Assignments</p>
                        {assignments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No assignments yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {assignments.slice(0, 5).map((assignment) => {
                              const volunteerName =
                                typeof assignment.volunteerId === "object" && assignment.volunteerId
                                  ? typeof assignment.volunteerId.userId === "object" && assignment.volunteerId.userId
                                    ? assignment.volunteerId.userId.name
                                    : assignment.volunteerId._id
                                  : assignment.volunteerId
                              const eventTitle =
                                typeof assignment.eventId === "object" && assignment.eventId
                                  ? assignment.eventId.title
                                  : assignment.eventId
                              return (
                                <div key={assignment._id} className="flex items-center justify-between text-sm">
                                  <div>
                                    <p className="font-medium">{volunteerName || "Volunteer"}</p>
                                    <p className="text-muted-foreground">{eventTitle || "Event"}</p>
                                  </div>
                                  <div className="text-muted-foreground">{assignment.status}</div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
