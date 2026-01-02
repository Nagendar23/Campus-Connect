import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

const payouts: any[] = []

export function PayoutHistory() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {payouts.length > 0 && <p className="text-sm text-muted-foreground">Next payout scheduled for March 6, 2025</p>}
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
          {payouts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                No payout history found
              </TableCell>
            </TableRow>
          ) : (
            payouts.map((payout) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
