"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, Clock } from "lucide-react"
import { api, type CheckInLog } from "@/lib/api"

interface CheckInHistoryProps {
  eventId: string
}

export function CheckInHistory({ eventId }: CheckInHistoryProps) {
  const [checkIns, setCheckIns] = useState<CheckInLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCheckIns = async () => {
      if (!eventId) return

      try {
        setLoading(true)
        const result = await api.getCheckInHistory({ eventId, limit: 50 })
        setCheckIns(result.data || result.items || [])
      } catch (error) {
        console.error("Failed to load check-in history:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCheckIns()
  }, [eventId])

  if (loading) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Loading check-in history...
      </p>
    )
  }

  if (checkIns.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No check-ins yet
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Attendee</TableHead>
          <TableHead>Ticket ID</TableHead>
          <TableHead>Check-in Time</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {checkIns.map((checkIn) => {
          const ticket =
            typeof checkIn.ticketId === "object" ? checkIn.ticketId : null
          const user =
            ticket && typeof ticket.userId === "object"
              ? ticket.userId
              : null

          return (
            <TableRow key={checkIn._id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "Unknown"}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-sm">
                  {typeof checkIn.ticketId === "string"
                    ? checkIn.ticketId.slice(0, 12)
                    : ticket?._id.slice(0, 12) || "Unknown"}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(checkIn.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  variant={checkIn.method === "qr" ? "default" : "secondary"}
                >
                  {checkIn.method === "qr" ? "QR Scan" : "Manual"}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 text-sm">Success</span>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
