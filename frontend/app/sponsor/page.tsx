"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useEffect, useState } from "react"

export default function SponsorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    opportunities: 0,
    activeDeals: 0,
    packages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadStats = async () => {
      try {
        setLoading(true)
        const profile = await api.getMySponsorProfile()
        const [opps, deals] = await Promise.all([
          api.listSponsorOpportunities({ status: "open" }),
          api.listSponsorshipDeals({ sponsorId: profile._id }),
        ])
        if (!mounted) return
        setStats({
          opportunities: opps.length,
          activeDeals: deals.filter((d) => d.status === "active").length,
          packages: profile.packages?.length || 0,
        })
      } catch {
        if (mounted) setStats({ opportunities: 0, activeDeals: 0, packages: 0 })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadStats()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AuthGuard requiredRole="sponsor">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role={user?.role as any} />
          <main className="flex-1 p-6">
            <div className="relative">
              <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200/50 via-rose-200/40 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute left-10 top-44 h-56 w-56 rounded-full bg-gradient-to-br from-sky-200/40 via-emerald-200/30 to-transparent blur-3xl" />
              <div className="max-w-7xl mx-auto space-y-8 relative">
                <div className="rounded-2xl border bg-gradient-to-br from-white via-white to-amber-50/70 p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sponsor Studio</div>
                      <h1 className="text-4xl font-semibold">Sponsor Dashboard</h1>
                      <p className="text-muted-foreground max-w-xl">
                        Match with high-impact events, track your sponsorship reach, and grow campus influence.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link href="/sponsor/marketplace">
                        <Button className="bg-foreground text-background hover:bg-foreground/90">Explore Marketplace</Button>
                      </Link>
                      <Link href="/sponsor/opportunities">
                        <Button variant="outline" className="bg-transparent">View Deals</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Open Opportunities</CardTitle>
                      <CardDescription>Events accepting sponsors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.opportunities}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-white">Active Deals</CardTitle>
                      <CardDescription className="text-white/70">Live sponsorships</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.activeDeals}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Packages</CardTitle>
                      <CardDescription>Your offerings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.packages}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common sponsor tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 flex-wrap">
                      <Link href="/sponsor/marketplace">
                        <Button variant="outline">Marketplace</Button>
                      </Link>
                      <Link href="/sponsor/opportunities">
                        <Button variant="outline">Opportunities</Button>
                      </Link>
                      <Link href="/sponsor/packages">
                        <Button variant="outline">My Packages</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
