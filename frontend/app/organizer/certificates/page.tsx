"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { useState } from "react"

export default function CertificatesDashboard() {
  const { user } = useAuth()
  const [eventId, setEventId] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [role, setRole] = useState("student")
  const [certificateUrl, setCertificateUrl] = useState("")
  const [lookupEventId, setLookupEventId] = useState("")
  const [certificates, setCertificates] = useState<any[]>([])
  const [status, setStatus] = useState<string | null>(null)

  const issueCertificate = async () => {
    if (!eventId.trim() || !recipientId.trim() || !certificateUrl.trim()) {
      setStatus("Provide event, recipient, and certificate URL.")
      return
    }
    try {
      await api.issueCertificate({
        eventId,
        userId: recipientId,
        role,
        certificateUrl,
      })
      setStatus("Certificate issued successfully.")
      setRecipientId("")
      setCertificateUrl("")
    } catch (err: any) {
      setStatus(err?.message || "Failed to issue certificate.")
    }
  }

  const loadCertificates = async () => {
    if (!lookupEventId.trim()) {
      setStatus("Provide an event ID to view certificates.")
      return
    }
    try {
      const items = await api.getEventCertificates(lookupEventId)
      setCertificates(items)
      setStatus(null)
    } catch (err: any) {
      setStatus(err?.message || "Failed to load certificates.")
    }
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
                <h1 className="text-3xl font-bold">Certificates</h1>
                <p className="text-muted-foreground">Issue and manage certificates for attendees, volunteers, and sponsors</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Certificate Management</CardTitle>
                  <CardDescription>Issue new certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Event ID</Label>
                      <Input value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="Event ID" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Recipient User ID</Label>
                      <Input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="User ID" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="sponsor">Sponsor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Certificate URL</Label>
                      <Input value={certificateUrl} onChange={(e) => setCertificateUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <Button onClick={issueCertificate}>Issue Certificate</Button>
                    {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Certificates</CardTitle>
                  <CardDescription>Lookup certificates issued for an event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <Input
                        value={lookupEventId}
                        onChange={(e) => setLookupEventId(e.target.value)}
                        placeholder="Event ID"
                      />
                      <Button variant="outline" onClick={loadCertificates}>
                        Load
                      </Button>
                    </div>
                    {certificates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No certificates loaded.</p>
                    ) : (
                      <div className="space-y-2">
                        {certificates.map((cert) => (
                          <div key={cert._id} className="rounded-md border p-3 text-sm">
                            <p className="font-medium">Role: {cert.role}</p>
                            <p className="text-muted-foreground">User: {cert.userId?._id || cert.userId}</p>
                            <a className="text-primary underline" href={cert.certificateUrl} target="_blank" rel="noreferrer">
                              View certificate
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
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
