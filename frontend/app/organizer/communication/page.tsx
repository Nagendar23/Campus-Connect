"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

export default function OrganizerCommunicationPage() {
  const { user } = useAuth()
  const [audience, setAudience] = useState("attendees")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const submitMessage = () => {
    if (!subject.trim() || !message.trim()) {
      setStatus("Please provide both a subject and message.")
      return
    }
    setStatus(`Message queued for ${audience}.`)
    setSubject("")
    setMessage("")
  }

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : undefined} />
        <div className="flex">
          <Sidebar role="organizer" />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Communication</h1>
                <p className="text-muted-foreground">Send updates and messages to attendees, volunteers, and sponsors</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Broadcast Message</CardTitle>
                  <CardDescription>Send an email or in-app notification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Audience</Label>
                      <Select value={audience} onValueChange={setAudience}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attendees">Attendees</SelectItem>
                          <SelectItem value="volunteers">Volunteers</SelectItem>
                          <SelectItem value="sponsors">Sponsors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Subject</Label>
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Event update" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Message</Label>
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Write a message..." />
                    </div>
                    <Button onClick={submitMessage}>Send Message</Button>
                    {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
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
