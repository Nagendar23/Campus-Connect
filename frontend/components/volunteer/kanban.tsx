"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api, type VolunteerTask } from "@/lib/api"

export type Task = {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "done"
}

const columns: { key: Task["status"]; title: string }[] = [
  { key: "todo", title: "To Do" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
]

function normalizeTask(task: VolunteerTask): Task {
  return {
    id: task._id,
    title: task.title,
    description: task.description,
    status: task.status,
  }
}

export default function VolunteerKanban({ eventId, assignedTo }: { eventId?: string; assignedTo?: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = async () => {
    setLoading(true)
    try {
      const result = await api.listVolunteerTasks({ eventId, assignedTo })
      setTasks((result.data || []).map(normalizeTask))
      setError(null)
    } catch (err: any) {
      setError(err?.message || "Failed to load volunteer tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [eventId, assignedTo])

  const createTask = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const result = await api.createVolunteerTask({
        title: title.trim(),
        description: description.trim() || undefined,
        eventId,
        assignedTo,
        status: "todo",
      })
      setTasks((current) => [normalizeTask(result.data), ...current])
      setTitle("")
      setDescription("")
      setError(null)
    } catch (err: any) {
      setError(err?.message || "Failed to create task")
    } finally {
      setSubmitting(false)
    }
  }

  const changeStatus = async (taskId: string, status: Task["status"]) => {
    const result = await api.updateVolunteerTask(taskId, { status })
    const updated = normalizeTask(result.data)
    setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)))
  }

  const removeTask = async (taskId: string) => {
    await api.deleteVolunteerTask(taskId)
    setTasks((current) => current.filter((task) => task.id !== taskId))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1.4fr_2fr_auto]">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
            <Button onClick={createTask} disabled={submitting || !title.trim()} className="md:self-start">
              {submitting ? "Saving..." : "Add Task"}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">Loading tasks...</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <Card key={column.key}>
            <CardHeader>
              <CardTitle>{column.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.filter((task) => task.status === column.key).map((task) => (
                  <div key={task.id} className="rounded-lg border border-border bg-card p-3 shadow-sm">
                    <div className="space-y-2">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description ? (
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {columns.map((target) => (
                          <Button
                            key={target.key}
                            size="sm"
                            variant={target.key === task.status ? "default" : "outline"}
                            onClick={() => changeStatus(task.id, target.key)}
                            disabled={target.key === task.status}
                          >
                            {target.title}
                          </Button>
                        ))}
                        <Button size="sm" variant="ghost" onClick={() => removeTask(task.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.filter((task) => task.status === column.key).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks in this column.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
