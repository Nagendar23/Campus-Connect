"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Users, Copy, Trash2, QrCode } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Event as ApiEvent, api } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface EventManagementTableProps {
  events: ApiEvent[]
  loading: boolean
  searchTerm: string
  onRefresh: () => void
}

export function EventManagementTable({ events, loading, searchTerm, onRefresh }: EventManagementTableProps) {
  const router = useRouter()

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      await api.deleteEvent(eventId)
      onRefresh()
    } catch (error) {
      console.error("Failed to delete event:", error)
      alert("Failed to delete event")
    }
  }

  const filteredEvents = events.filter((event) => {
    const search = searchTerm.toLowerCase()
    return (
      event.title.toLowerCase().includes(search) ||
      event.category?.toLowerCase().includes(search) ||
      event.status.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading events...</p>
  }

  if (filteredEvents.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No events found</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Details</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredEvents.map((event) => {
          const startDate = new Date(event.startTime)
          const endDate = new Date(event.endTime)
          const now = new Date()
          
          let displayStatus = event.status
          if (event.status === 'published') {
            if (startDate > now) displayStatus = 'upcoming'
            else if (endDate < now) displayStatus = 'completed'
            else displayStatus = 'active'
          }

          return (
            <TableRow key={event._id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{event.title}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {event.category || 'General'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{event.venue || event.location}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm">{startDate.toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={displayStatus === "active" ? "default" : displayStatus === "completed" ? "secondary" : "outline"}
                  className={displayStatus === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                >
                  {displayStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm">
                    {event.registeredCount || 0}/{event.capacity}
                  </p>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, ((event.registeredCount || 0) / event.capacity) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </TableCell>
              <TableCell>${event.isPaid && event.price ? event.price.toFixed(2) : '0.00'}</TableCell>
              <TableCell>
                <span className="text-muted-foreground">-</span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/events/${event._id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/organizer/events/${event._id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/organizer/attendees?event=${event._id}`)}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Attendees
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/organizer/scanner?event=${event._id}`)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      QR Scanner
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(event._id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
