import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type Event as ApiEvent } from "@/lib/api"
import Link from "next/link"

interface RecentEventsTableProps {
  events: ApiEvent[]
  loading?: boolean
}

export function RecentEventsTable({ events, loading }: RecentEventsTableProps) {
  const recentEvents = events.slice(0, 4) // Show only 4 most recent

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading events...
      </div>
    )
  }

  if (recentEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events created yet. <Link href="/organizer/create" className="text-primary underline">Create your first event</Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentEvents.map((event) => {
          const isPast = new Date(event.endTime) < new Date()
          const status = event.status === 'published' ? (isPast ? 'completed' : 'active') : 'draft'
          const revenue = event.isPaid && event.price ? (event.registeredCount || 0) * event.price : 0
          
          return (
            <TableRow key={event._id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{new Date(event.startTime).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant={status === "active" ? "default" : status === "completed" ? "secondary" : "outline"}
                  className={status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                >
                  {status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {event.registeredCount || 0}/{event.capacity}
                  </span>
                </div>
              </TableCell>
              <TableCell>${revenue.toFixed(2)}</TableCell>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/events/${event._id}`} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/events/${event._id}/edit`} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/organizer/attendees?eventId=${event._id}`} className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Attendees
                      </Link>
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
