"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentTransactionsTable } from "@/components/organizer/payment-transactions-table"
import { PayoutHistory } from "@/components/organizer/payout-history"
import { DollarSign, TrendingUp, CreditCard, Calendar, Download, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api, type Payment } from "@/lib/api"

export default function OrganizerPaymentsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("30days")
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPayments = async () => {
      if (!user) return

      try {
        setLoading(true)
        const result = await api.getOrganizerPayments(user._id, { limit: 500 })
        setPayments(result.data || result.items || [])
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [user])

  const stats = {
    totalRevenue: payments.reduce((sum, p) => p.status === 'succeeded' ? sum + p.amount : sum, 0),
    pendingPayouts: payments.reduce((sum, p) => p.status === 'pending' ? sum + p.amount : sum, 0),
    completedTransactions: payments.filter(p => p.status === 'succeeded').length,
    refundedAmount: payments.reduce((sum, p) => p.status === 'refunded' ? sum + p.amount : sum, 0),
    processingFees: 0, // TODO: Calculate
    netRevenue: payments.reduce((sum, p) => p.status === 'succeeded' ? sum + p.amount : sum, 0),
  }

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Payment Management</h1>
                  <p className="text-muted-foreground">Track revenue, payouts, and transaction history</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-transparent">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-green-500">+15.2% vs last period</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Net Revenue</p>
                        <p className="text-2xl font-bold">${stats.netRevenue.toLocaleString()}</p>
                        <p className="text-xs text-green-500">After fees</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Payouts</p>
                        <p className="text-2xl font-bold">${stats.pendingPayouts.toLocaleString()}</p>
                        <p className="text-xs text-orange-500">Next payout: Feb 28</p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-2xl font-bold">{stats.completedTransactions}</p>
                        <p className="text-xs text-green-500">Completed</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Processing Fees</p>
                        <p className="text-2xl font-bold">${stats.processingFees.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">5.04% avg rate</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Refunded</p>
                        <p className="text-2xl font-bold">${stats.refundedAmount.toLocaleString()}</p>
                        <p className="text-xs text-red-500">3.6% of total</p>
                      </div>
                      <RefreshCw className="h-8 w-8 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Management Tabs */}
              <Tabs defaultValue="transactions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="payouts">Payouts</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Transaction History</CardTitle>
                          <CardDescription>All payment transactions for your events</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PaymentTransactionsTable searchTerm={searchTerm} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payouts" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payout History</CardTitle>
                      <CardDescription>Track your payment transfers and schedules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PayoutHistory />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payout Settings</CardTitle>
                        <CardDescription>Configure your payout preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Payout Schedule</label>
                          <Select defaultValue="weekly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Minimum Payout Amount</label>
                          <Input placeholder="$50.00" />
                        </div>
                        <Button className="w-full">Update Payout Settings</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Bank Account</CardTitle>
                        <CardDescription>Manage your payout destination</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Chase Bank</p>
                              <p className="text-sm text-muted-foreground">•••• •••• •••• 4567</p>
                              <p className="text-xs text-green-500">Verified</p>
                            </div>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Edit
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full bg-transparent">
                          Add New Account
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
