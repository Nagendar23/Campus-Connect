"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type SponsorOpportunity } from "@/lib/api"
import { useEffect, useState } from "react"

export default function SponsorMarketplacePage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<SponsorOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadOpportunities = async () => {
      try {
        setLoading(true)
        setError(null)
        const items = await api.listSponsorOpportunities()
        if (mounted) {
          setOpportunities(items)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load opportunities")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadOpportunities()

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
                <h1 className="text-3xl font-bold">Marketplace</h1>
                <p className="text-muted-foreground">Discover events looking for sponsors</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Event Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading opportunities...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : opportunities.length === 0 ? (
                    <p>No opportunities available yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {opportunities.map((item) => (
                        <div key={item._id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              {item.description ? (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              ) : null}
                            </div>
                            <div className="text-sm text-muted-foreground">{item.status}</div>
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
