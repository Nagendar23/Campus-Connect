"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export default function SponsorDashboard() {
  const { user } = useAuth()

  return (
    <AuthGuard requiredRole="sponsor">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role={user?.role as any} />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
                  <p className="text-muted-foreground">Discover events and manage sponsorship packages</p>
                </div>
                <div>
                  <Link href="/sponsor/marketplace">
                    <Button className="bg-primary">Explore Marketplace</Button>
                  </Link>
                </div>
              </div>

              <Card>
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
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
