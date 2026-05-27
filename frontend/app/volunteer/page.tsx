"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import VolunteerKanban from "@/components/volunteer/kanban"

export default function VolunteerDashboard() {
  const { user } = useAuth()

  return (
    <AuthGuard requiredRole="volunteer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role={user?.role as any} />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Volunteer'}!</h1>
                  <p className="text-muted-foreground">View your tasks, applications, and achievements</p>
                </div>
                <div>
                  <Link href="/events">
                    <Button className="bg-primary">Browse Events</Button>
                  </Link>
                </div>
              </div>

              <Card>
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
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
