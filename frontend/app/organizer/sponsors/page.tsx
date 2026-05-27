"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type SponsorOpportunity, type SponsorshipDeal } from "@/lib/api"
import { useEffect, useState } from "react"

export default function OrganizerSponsorsPage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<SponsorOpportunity[]>([])
  const [deals, setDeals] = useState<SponsorshipDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadSponsorData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [ops, sDeals] = await Promise.all([
          api.listSponsorOpportunities(),
          api.listSponsorshipDeals(),
        ])
        if (mounted) {
          setOpportunities(ops)
          setDeals(sDeals)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load sponsor data")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadSponsorData()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Sponsors</h1>
                <p className="text-muted-foreground">Manage your event sponsors and funding</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Discovery</CardTitle>
                  <CardDescription>Find and manage sponsors for your events</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading sponsor data...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">Opportunities</p>
                        <p className="text-2xl font-semibold">{opportunities.length}</p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">Active Deals</p>
                        <p className="text-2xl font-semibold">{deals.length}</p>
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
