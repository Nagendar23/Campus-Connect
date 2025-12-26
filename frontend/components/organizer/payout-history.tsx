import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

const payouts = [
  {
    id: "PO-001",
    amount: 1250.0,
    status: "completed",
    date: "2025-02-20",
    bankAccount: "•••• 4567",
    transactionCount: 15,
    period: "Feb 13 - Feb 19, 2025",
  },
  {
    id: "PO-002",
    amount: 890.5,
    status: "completed",
    date: "2025-02-13",
    bankAccount: "•••• 4567",
    transactionCount: 12,
    period: "Feb 6 - Feb 12, 2025",
  },
  {
    id: "PO-003",
    amount: 2100.0,
    status: "processing",
    date: "2025-02-27",
    bankAccount: "•••• 4567",
    transactionCount: 23,
    period: "Feb 20 - Feb 26, 2025",
  },
  {
    id: "PO-004",
    amount: 675.25,
    status: "pending",
    date: "2025-03-06",
    bankAccount: "•••• 4567",
    transactionCount: 8,
    period: "Feb 27 - Mar 5, 2025",
  },
]

export function PayoutHistory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Next payout scheduled for March 6, 2025</p>
        </div>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Payout
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payout ID</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Transactions</TableHead>
            <TableHead>Bank Account</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((payout) => (
            <TableRow key={payout.id}>
              <TableCell>
                <div>
                  <p className="font-medium font-mono">{payout.id}</p>
                  <p className="text-sm text-muted-foreground">{payout.date}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{payout.period}</p>
              </TableCell>
              <TableCell>
                <p className="font-medium text-green-500">${payout.amount.toFixed(2)}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{payout.transactionCount} transactions</p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-mono">{payout.bankAccount}</p>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    payout.status === "completed" ? "default" : payout.status === "processing" ? "secondary" : "outline"
                  }
                >
                  {payout.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
