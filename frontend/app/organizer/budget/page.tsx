"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

type BudgetTransaction = {
  _id: string
  eventId: string | { _id: string; title?: string }
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

export default function BudgetDashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadBudget = async () => {
      try {
        setLoading(true)
        setError(null)
        const items = await api.getMyBudget()
        if (mounted) {
          setTransactions(items as BudgetTransaction[])
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load budget data")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadBudget()

    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.type === "income") acc.income += item.amount
        else acc.expense += item.amount
        return acc
      },
      { income: 0, expense: 0 }
    )
  }, [transactions])

  const chartData = useMemo(() => {
    const buckets: Record<string, { month: string; income: number; expense: number }> = {}
    transactions.forEach((item) => {
      const date = new Date(item.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!buckets[key]) {
        buckets[key] = {
          month: date.toLocaleDateString("en-US", { month: "short" }),
          income: 0,
          expense: 0,
        }
      }
      if (item.type === "income") buckets[key].income += item.amount
      else buckets[key].expense += item.amount
    })
    return Object.values(buckets)
  }, [transactions])

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Budget Tracking</h1>
                <p className="text-muted-foreground">Manage your event budgets and track ROI</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Your budget analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading budget...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Total Income</p>
                          <p className="text-2xl font-semibold">${summary.income.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Total Expense</p>
                          <p className="text-2xl font-semibold">${summary.expense.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                          <p className="text-sm text-muted-foreground">Net</p>
                          <p className="text-2xl font-semibold">${(summary.income - summary.expense).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground mb-3">Monthly Cashflow</p>
                        {chartData.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No transactions yet.</p>
                        ) : (
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData}>
                              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip />
                              <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground mb-3">Recent Transactions</p>
                        {transactions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No transactions recorded.</p>
                        ) : (
                          <div className="space-y-3">
                            {transactions.slice(0, 5).map((item) => (
                              <div key={item._id} className="flex items-center justify-between text-sm">
                                <div>
                                  <p className="font-medium">{item.category}</p>
                                  <p className="text-muted-foreground">{item.description}</p>
                                </div>
                                <div className="text-right">
                                  <p className={item.type === "income" ? "text-emerald-600" : "text-destructive"}>
                                    {item.type === "income" ? "+" : "-"}${item.amount.toFixed(2)}
                                  </p>
                                  <p className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
