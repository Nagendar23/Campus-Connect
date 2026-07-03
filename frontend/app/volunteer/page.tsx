"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import VolunteerKanban from "@/components/volunteer/kanban"
import { api } from "@/lib/api"
import { useEffect, useState } from "react"

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    tasks: 0,
    applications: 0,
    achievements: 0,
    score: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadStats = async () => {
      try {
        setLoading(true)
        const profile = await api.getMyVolunteerProfile()
        const [tasksRes, appsRes] = await Promise.all([
          api.listVolunteerTasks({ assignedTo: profile._id }),
          api.listVolunteerApplications({ volunteerId: profile._id }),
        ])
        if (!mounted) return
        setStats({
          tasks: (tasksRes.data || []).length,
          applications: appsRes.length,
          achievements: profile.achievements?.length || 0,
          score: profile.score || 0,
        })
      } catch {
        if (mounted) {
          setStats({ tasks: 0, applications: 0, achievements: 0, score: 0 })
        }
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
    <AuthGuard requiredRole="volunteer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role={user?.role as any} />
          <main className="flex-1 p-6">
            <div className="relative">
              <div className="pointer-events-none absolute -top-16 right-6 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-200/50 via-sky-200/40 to-transparent blur-3xl" />
              <div className="pointer-events-none absolute left-0 top-44 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-transparent blur-3xl" />
              <div className="max-w-7xl mx-auto space-y-8 relative">
                <div className="rounded-2xl border bg-gradient-to-br from-white via-white to-emerald-50/60 p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Volunteer Hub</div>
                      <h1 className="text-4xl font-semibold">Welcome, {user?.name || "Volunteer"}</h1>
                      <p className="text-muted-foreground max-w-xl">
                        Track your tasks, keep your applications moving, and build your achievement trail.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Link href="/events">
                        <Button className="bg-foreground text-background hover:bg-foreground/90">Browse Events</Button>
                      </Link>
                      <Link href="/volunteer/applications">
                        <Button variant="outline" className="bg-transparent">Review Applications</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-white">Score</CardTitle>
                      <CardDescription className="text-white/70">Leadership points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.score}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Tasks</CardTitle>
                      <CardDescription>Assigned to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.tasks}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Applications</CardTitle>
                      <CardDescription>Submitted</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.applications}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                      <CardDescription>Badges earned</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold">{loading ? "..." : stats.achievements}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common volunteer tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 flex-wrap">
                      <Link href="/volunteer/my-tasks">
                        <Button variant="outline">My Tasks</Button>
                      </Link>
                      <Link href="/volunteer/applications">
                        <Button variant="outline">Applications</Button>
                      </Link>
                      <Link href="/volunteer/achievements">
                        <Button variant="outline">Achievements</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Task Board</CardTitle>
                    <CardDescription>Create, update, and clear volunteer tasks backed by the API.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VolunteerKanban />
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
