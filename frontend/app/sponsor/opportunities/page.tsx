"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type SponsorshipDeal } from "@/lib/api"
import { useEffect, useState } from "react"

export default function SponsorOpportunitiesPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<SponsorshipDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadDeals = async () => {
      try {
        setLoading(true)
        setError(null)
        const profile = await api.getMySponsorProfile()
        const items = await api.listSponsorshipDeals({ sponsorId: profile._id })
        if (mounted) {
          setDeals(items)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load sponsorships")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDeals()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AuthGuard requiredRole="sponsor">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="sponsor" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Opportunities</h1>
                <p className="text-muted-foreground">Manage your sponsorship opportunities and ROI</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sponsorships</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading sponsorships...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : deals.length === 0 ? (
                    <p>No sponsorships yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {deals.map((deal) => (
                        <div key={deal._id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{deal.packageTitle || "Sponsorship Deal"}</p>
                              <p className="text-sm text-muted-foreground">Amount: ${deal.amount}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">{deal.status}</div>
                          </div>
                        </div>
                      ))}
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
