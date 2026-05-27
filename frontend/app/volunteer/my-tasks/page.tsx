"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { api, type VolunteerTask } from "@/lib/api"
import { useEffect, useState } from "react"

export default function MyTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<VolunteerTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)
        const profile = await api.getMyVolunteerProfile()
        const response = await api.listVolunteerTasks({ assignedTo: profile._id })
        const items = response.data || []
        if (mounted) {
          setTasks(items)
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to load tasks")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadTasks()

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
                <h1 className="text-3xl font-bold">My Tasks</h1>
                <p className="text-muted-foreground">Manage your assigned volunteer tasks</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tasks List</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading tasks...</p>
                  ) : error ? (
                    <p className="text-destructive">{error}</p>
                  ) : tasks.length === 0 ? (
                    <p>No tasks assigned yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task._id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{task.title}</p>
                              {task.description ? (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              ) : null}
                            </div>
                            <div className="text-sm text-muted-foreground">{task.status}</div>
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
