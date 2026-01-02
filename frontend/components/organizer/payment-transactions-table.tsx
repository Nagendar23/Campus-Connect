import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Download, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PaymentTransactionsTableProps {
  searchTerm: string
}

const transactions: any[] = []

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
        {filteredTransactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
              No transactions found
            </TableCell>
          </TableRow>
        ) : (
          filteredTransactions.map((transaction) => (
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
          ))
        )}
      </TableBody>
    </Table>
  )
}
