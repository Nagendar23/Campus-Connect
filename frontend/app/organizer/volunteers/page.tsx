"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type VolunteerApplication, type VolunteerAssignment } from "@/lib/api"
import { useEffect, useState } from "react"

export default function OrganizerVolunteersPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadVolunteerData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [apps, assigns] = await Promise.all([
          api.listVolunteerApplications(),
          api.listVolunteerAssignments(),
        ])
        if (mounted) {
          setApplications(apps)
          setAssignments(assigns)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load volunteer data")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadVolunteerData()

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
                <h1 className="text-3xl font-bold">Volunteer Hiring</h1>
                <p className="text-muted-foreground">Manage volunteer applications and assign tasks</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Matching</CardTitle>
                  <CardDescription>Match volunteers to open tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading volunteer activity...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">Applications</p>
                        <p className="text-2xl font-semibold">{applications.length}</p>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">Assignments</p>
                        <p className="text-2xl font-semibold">{assignments.length}</p>
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
