import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, TrendingDown, Eye } from "lucide-react"

const events = [
  {
    id: "1",
    name: "Tech Innovation Summit",
    date: "Feb 15, 2025",
    registered: 342,
    attended: 298,
    revenue: 5420,
    rating: 4.8,
    feedback: 156,
    status: "completed",
    trend: "up",
  },
  {
    id: "2",
    name: "Spring Career Fair",
    date: "Feb 20, 2025",
    registered: 756,
    attended: 689,
    revenue: 3240,
    rating: 4.6,
    feedback: 234,
    status: "completed",
    trend: "up",
  },
  {
    id: "3",
    name: "Cultural Night",
    date: "Feb 25, 2025",
    registered: 189,
    attended: 167,
    revenue: 1890,
    rating: 4.4,
    feedback: 89,
    status: "completed",
    trend: "down",
  },
  {
    id: "4",
    name: "Startup Pitch Competition",
    date: "Mar 1, 2025",
    registered: 234,
    attended: 0,
    revenue: 2890,
    rating: 0,
    feedback: 0,
    status: "upcoming",
    trend: "up",
  },
]

export function EventPerformanceTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Feedback</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>
              <div>
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-muted-foreground">{event.date}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {event.attended}/{event.registered}
                  </span>
                  {event.status === "completed" && (
                    <>
                      {event.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </>
                  )}
                </div>
                {event.status === "completed" && (
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full"
                      style={{ width: `${(event.attended / event.registered) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="font-medium text-green-500">${event.revenue.toLocaleString()}</span>
            </TableCell>
            <TableCell>
              {event.status === "completed" ? (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{event.rating}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {event.status === "completed" ? (
                <span className="text-sm">{event.feedback} responses</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  event.status === "completed" ? "default" : event.status === "upcoming" ? "secondary" : "outline"
                }
              >
                {event.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
