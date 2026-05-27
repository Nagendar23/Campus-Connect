"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type VolunteerApplication } from "@/lib/api"
import { useEffect, useState } from "react"

export default function VolunteerApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadApplications = async () => {
      try {
        setLoading(true)
        setError(null)
        const profile = await api.getMyVolunteerProfile()
        const items = await api.listVolunteerApplications({ volunteerId: profile._id })
        if (mounted) {
          setApplications(items)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load applications")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <AuthGuard requiredRole="volunteer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="volunteer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Applications</h1>
                <p className="text-muted-foreground">Manage your event volunteer applications</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>My Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading applications...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : applications.length === 0 ? (
                    <p>No applications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => {
                        const eventTitle =
                          typeof app.eventId === "object" && app.eventId
                            ? app.eventId.title
                            : app.eventId
                        return (
                          <div key={app._id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{eventTitle || "Event"}</p>
                                <p className="text-sm text-muted-foreground">Status: {app.status}</p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : ""}
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
