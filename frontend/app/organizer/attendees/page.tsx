"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Mail, UserCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api, type Event as ApiEvent, type Registration } from "@/lib/api"
import Link from "next/link"

export default function AttendeesPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [attendees, setAttendees] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadEvents = async () => {
      if (!user) return

      try {
        setLoading(true)
        const eventsRes = await api.getOrganizerEvents(user._id, { 
          limit: 100
        })
        setEvents(eventsRes.data || [])
        if (eventsRes.data && eventsRes.data.length > 0) {
          setSelectedEvent(eventsRes.data[0]._id)
        }
      } catch (error) {
        console.error("Failed to load events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user])

  useEffect(() => {
    const loadAttendees = async () => {
      if (!selectedEvent) return

      try {
        const registrations = await api.getEventRegistrations(selectedEvent, { limit: 500 })
        setAttendees(registrations.data || registrations.items || [])
      } catch (error) {
        console.error("Failed to load attendees:", error)
      }
    }

    loadAttendees()
  }, [selectedEvent])

  const filteredAttendees = attendees.filter((attendee) => {
    const userInfo = typeof attendee.userId === 'object' ? attendee.userId : null
    if (!userInfo) return false
    
    const name = userInfo.name?.toLowerCase() || ''
    const email = userInfo.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    
    return name.includes(search) || email.includes(search)
  })

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
                  <h1 className="text-3xl font-bold">Manage Attendees</h1>
                  <p className="text-muted-foreground">View and manage event registrations</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {/* Event Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Event</CardTitle>
                  <CardDescription>Choose an event to view its attendees</CardDescription>
                </CardHeader>
                <CardContent>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedEvent || ""}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="">Select an event</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title} - {new Date(event.startTime).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Attendees Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Registered Attendees</CardTitle>
                      <CardDescription>{filteredAttendees.length} total registrations</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by name or email" 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                  ) : filteredAttendees.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No attendees found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Registered On</TableHead>
                          <TableHead>Ticket ID</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendees.map((attendee) => {
                          const userInfo = typeof attendee.userId === 'object' ? attendee.userId : null
                          return (
                            <TableRow key={attendee._id}>
                              <TableCell className="font-medium">{userInfo?.name || 'N/A'}</TableCell>
                              <TableCell>{userInfo?.email || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={attendee.status === 'confirmed' ? 'default' : 'secondary'}
                                  className={attendee.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                                >
                                  {attendee.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(attendee.createdAt || '').toLocaleDateString()}</TableCell>
                              <TableCell className="font-mono text-xs">{attendee.ticketId?.slice(0, 8) || 'N/A'}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
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
