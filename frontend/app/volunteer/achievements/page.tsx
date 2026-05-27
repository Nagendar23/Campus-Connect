"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type Volunteer } from "@/lib/api"
import { useEffect, useState } from "react"

export default function VolunteerAchievementsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Volunteer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getMyVolunteerProfile()
        if (mounted) {
          setProfile(data)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load achievements")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

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
                <h1 className="text-3xl font-bold">Achievements</h1>
                <p className="text-muted-foreground">Track your volunteer score and achievements</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Leadership Board</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading achievements...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Volunteer Score</p>
                        <p className="text-3xl font-semibold">{profile?.score ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Achievements</p>
                        {profile?.achievements?.length ? (
                          <div className="space-y-2">
                            {profile.achievements.map((ach, index) => (
                              <div key={`${ach.title}-${index}`} className="rounded-md border p-3">
                                <p className="font-medium">{ach.title}</p>
                                <p className="text-sm text-muted-foreground">Points: {ach.points ?? 0}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No achievements yet.</p>
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
