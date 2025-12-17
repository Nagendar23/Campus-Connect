import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Download, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PaymentTransactionsTableProps {
  searchTerm: string
}

const transactions = [
  {
    id: "TXN-001",
    eventName: "Tech Innovation Summit",
    attendeeName: "John Doe",
    attendeeEmail: "john.doe@university.edu",
    amount: 25.0,
    processingFee: 2.5,
    netAmount: 22.5,
    status: "completed",
    paymentMethod: "Visa •••• 4242",
    date: "2025-02-15",
    time: "09:15 AM",
  },
  {
    id: "TXN-002",
    eventName: "Spring Career Fair",
    attendeeName: "Jane Smith",
    attendeeEmail: "jane.smith@university.edu",
    amount: 0.0,
    processingFee: 0.0,
    netAmount: 0.0,
    status: "completed",
    paymentMethod: "Free Event",
    date: "2025-02-14",
    time: "02:30 PM",
  },
  {
    id: "TXN-003",
    eventName: "Cultural Night",
    attendeeName: "Mike Johnson",
    attendeeEmail: "mike.johnson@university.edu",
    amount: 15.0,
    processingFee: 2.0,
    netAmount: 13.0,
    status: "refunded",
    paymentMethod: "Mastercard •••• 5555",
    date: "2025-02-13",
    time: "11:45 AM",
  },
  {
    id: "TXN-004",
    eventName: "Startup Pitch Competition",
    attendeeName: "Sarah Wilson",
    attendeeEmail: "sarah.wilson@university.edu",
    amount: 30.0,
    processingFee: 3.0,
    netAmount: 27.0,
    status: "pending",
    paymentMethod: "Apple Pay",
    date: "2025-02-12",
    time: "04:20 PM",
  },
  {
    id: "TXN-005",
    eventName: "Tech Innovation Summit",
    attendeeName: "David Brown",
    attendeeEmail: "david.brown@university.edu",
    amount: 25.0,
    processingFee: 2.5,
    netAmount: 22.5,
    status: "failed",
    paymentMethod: "Visa •••• 1234",
    date: "2025-02-11",
    time: "07:10 PM",
  },
]

export function PaymentTransactionsTable({ searchTerm }: PaymentTransactionsTableProps) {
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Attendee</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Net Amount</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTransactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <div>
                <p className="font-medium font-mono">{transaction.id}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.date} at {transaction.time}
                </p>
              </div>
            </TableCell>
            <TableCell>
              <p className="font-medium">{transaction.eventName}</p>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{transaction.attendeeName}</p>
                <p className="text-sm text-muted-foreground">{transaction.attendeeEmail}</p>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                {transaction.processingFee > 0 && (
                  <p className="text-xs text-muted-foreground">Fee: ${transaction.processingFee.toFixed(2)}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <p className="font-medium text-green-500">${transaction.netAmount.toFixed(2)}</p>
            </TableCell>
            <TableCell>
              <span className="text-sm">{transaction.paymentMethod}</span>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.status === "completed"
                    ? "default"
                    : transaction.status === "pending"
                      ? "secondary"
                      : transaction.status === "refunded"
                        ? "outline"
                        : "destructive"
                }
              >
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </DropdownMenuItem>
                  {transaction.status === "completed" && (
                    <DropdownMenuItem>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Issue Refund
                    </DropdownMenuItem>
                  )}
                  {transaction.status === "failed" && (
                    <DropdownMenuItem>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Payment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
