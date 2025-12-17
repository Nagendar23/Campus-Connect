"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Download, Eye, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api, type Payment } from "@/lib/api"

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.getPaymentHistory({ limit: 50 })
        setPayments(res.items || [])
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Loading payment history...
      </p>
    )
  }

  if (payments.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No payment history yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Payment Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>

      <TableBody>
        {payments.map((payment) => {
          const event =
            typeof payment.eventId === "object" ? payment.eventId : null

          return (
            <TableRow key={payment._id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">
                    {event?.title || "Unknown Event"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Event date:{" "}
                    {event
                      ? new Date(event.startTime).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {payment._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {payment.providerRef || "N/A"}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <p className="font-medium">
                  ${(payment.amount / 100).toFixed(2)}
                </p>
              </TableCell>

              <TableCell>
                <p className="text-sm">{payment.provider || "Card"}</p>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    payment.status === "succeeded"
                      ? "default"
                      : payment.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                  className={
                    payment.status === "succeeded"
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                >
                  {payment.status}
                </Badge>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </DropdownMenuItem>

                    {payment.status === "succeeded" && (
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Refund
                      </DropdownMenuItem>
                    )}
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
