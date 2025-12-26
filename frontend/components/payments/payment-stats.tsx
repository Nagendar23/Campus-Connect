"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, TrendingUp, Calendar } from "lucide-react"
import { api, type Payment } from "@/lib/api"

export function PaymentStats() {
  const [stats, setStats] = useState({
    totalSpent: 0,
    thisMonth: 0,
    monthCount: 0,
    avgPerEvent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.getPaymentHistory({ limit: 100 })
        const payments = res.items || []
        
        const total = payments.reduce((sum, p) => sum + (p.amount / 100), 0)
        
        const now = new Date()
        const thisMonthPayments = payments.filter(p => {
          const paymentDate = new Date(p.createdAt)
          return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
        })
        const monthTotal = thisMonthPayments.reduce((sum, p) => sum + (p.amount / 100), 0)
        
        setStats({
          totalSpent: total,
          thisMonth: monthTotal,
          monthCount: thisMonthPayments.length,
          avgPerEvent: payments.length > 0 ? total / payments.length : 0
        })
      } catch (error) {
        console.error("Failed to load payment stats:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : `$${stats.totalSpent.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : `$${stats.thisMonth.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">{stats.monthCount} transactions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg per Event</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : `$${stats.avgPerEvent.toFixed(2)}`}</div>
          <p className="text-xs text-muted-foreground">Per transaction</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Active card</p>
        </CardContent>
      </Card>
    </div>
  )
}
