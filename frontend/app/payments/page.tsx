"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PaymentHistory } from "@/components/payments/payment-history"
import { PaymentStats } from "@/components/payments/payment-stats"
import { Search, Download, CreditCard } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function PaymentsPage() {
  const { user } = useAuth()

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="student" />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Payment History</h1>
                  <p className="text-muted-foreground">View your event payments and transaction history</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export History
                </Button>
              </div>

              {/* Payment Stats */}
              <PaymentStats />

              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Search</CardTitle>
                  <CardDescription>Find specific payments and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search by event name, transaction ID, or amount..." className="pl-10" />
                    </div>
                    <Button variant="outline" className="bg-transparent">
                      Advanced Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your payment history for campus events</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentHistory />
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Saved Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods for faster checkout</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground py-8">
                      Payment methods will be saved during checkout. Currently no saved methods.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment methods managed during event registration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
