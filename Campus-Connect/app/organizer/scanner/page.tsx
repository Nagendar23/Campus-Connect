"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { QRScanner } from "@/components/qr/qr-scanner"
import { CheckInHistory } from "@/components/organizer/checkin-history"
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  Users,
  CheckCircle,
  Download,
  FileText,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api, type Event as ApiEvent } from "@/lib/api"

export default function QRScannerPage() {
  const { user } = useAuth()

  const [events, setEvents] = useState<ApiEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [manualTicketId, setManualTicketId] = useState("")
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    checkedIn: 0,
    totalRegistered: 0,
  })

  const [scanResult, setScanResult] = useState<{
    success: boolean
    message: string
    attendee?: {
      name: string
      email: string
      ticketId: string
      eventTitle: string
    }
  } | null>(null)

  const [bulkResults, setBulkResults] = useState<
    {
      ticketId: string
      name: string
      status: "success" | "error" | "duplicate"
      message: string
      timestamp: string
    }[]
  >([])

  /* ---------------- LOAD ORGANIZER EVENTS ---------------- */
  useEffect(() => {
    if (!user) return

    const loadEvents = async () => {
      try {
        setLoading(true)
        const res = await api.getOrganizerEvents(user._id, {
          limit: 100,
        })

        const items = (res.data || []).filter(e => e.status === "published")
        setEvents(items)

        if (items.length > 0) {
          setSelectedEvent(items[0]._id)
        }
      } catch (err) {
        console.error("Failed to load events:", err)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user])

  /* ---------------- LOAD STATS ---------------- */
  useEffect(() => {
    if (!selectedEvent) return

    const loadStats = async () => {
      try {
        const checkIns = await api.getCheckInHistory({
          eventId: selectedEvent,
          limit: 1000,
        })

        const registrations = await api.getEventRegistrations(selectedEvent, {
          limit: 1000,
        })

        setStats({
          checkedIn: checkIns.total || 0,
          totalRegistered: registrations.total || 0,
        })
      } catch (err) {
        console.error("Failed to load stats:", err)
      }
    }

    loadStats()
  }, [selectedEvent])

  /* ---------------- HANDLE QR SCAN ---------------- */
  const handleScanResult = async (token: string) => {
    try {
      const res = await api.scanQRCode({ token })

      const event =
        typeof res.event === "object"
          ? res.event
          : events.find((e) => e._id === selectedEvent)

      const attendee =
        typeof res.user === "object" ? res.user : null

      setScanResult({
        success: true,
        message: "Check-in successful",
        attendee: {
          name: attendee?.name || "Unknown",
          email: attendee?.email || "Unknown",
          ticketId: res.ticketId,
          eventTitle: event?.title || "Event",
        },
      })

      setStats((prev) => ({
        ...prev,
        checkedIn: prev.checkedIn + 1,
      }))

      if (bulkMode) {
        setBulkResults((prev) => [
          {
            ticketId: res.ticketId,
            name: attendee?.name || "Unknown",
            status: "success",
            message: "Checked in",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev,
        ])
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || "Check-in failed",
      })
    }

    if (!bulkMode) {
      setTimeout(() => setScanResult(null), 4000)
    }
  }

  /* ---------------- MANUAL CHECK-IN ---------------- */
  const handleManualCheckIn = async () => {
    if (!manualTicketId.trim()) return

    try {
      const qr = await api.getTicketQRCode(manualTicketId.trim())
      await handleScanResult(qr.token)
      setManualTicketId("")
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.message || "Invalid ticket",
      })
    }
  }

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen bg-background">
        <Navbar
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl,
                }
              : undefined
          }
        />

        <div className="flex">
          <Sidebar role="organizer" />

          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">QR Scanner</h1>
                  <p className="text-muted-foreground">
                    Check in attendees for your event
                  </p>
                </div>

                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="h-10 w-64 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select Event</option>
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Checked In" value={stats.checkedIn} />
                <StatCard label="Registered" value={stats.totalRegistered} />
                <StatCard
                  label="Attendance"
                  value={
                    stats.totalRegistered
                      ? `${Math.round(
                          (stats.checkedIn / stats.totalRegistered) * 100
                        )}%`
                      : "0%"
                  }
                />
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Bulk Mode</p>
                      <p className="font-medium">
                        {bulkMode ? "Active" : "Off"}
                      </p>
                    </div>
                    <Switch checked={bulkMode} onCheckedChange={setBulkMode} />
                  </CardContent>
                </Card>
              </div>

              {/* SCANNER */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Scanner
                  </CardTitle>
                  <CardDescription>
                    Scan attendee QR codes to check in
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setIsScanning((v) => !v)}
                    className={isScanning ? "bg-red-500" : ""}
                  >
                    {isScanning ? (
                      <>
                        <CameraOff className="mr-2 h-4 w-4" />
                        Stop Scanner
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Start Scanner
                      </>
                    )}
                  </Button>

                  {isScanning && (
                    <div className="border rounded-lg p-4">
                      <QRScanner onScan={handleScanResult} />
                    </div>
                  )}

                  {scanResult && (
                    <div
                      className={`p-4 rounded ${
                        scanResult.success
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      <p className="font-medium">{scanResult.message}</p>
                      {scanResult.attendee && (
                        <p className="text-sm text-muted-foreground">
                          {scanResult.attendee.name} —{" "}
                          {scanResult.attendee.email}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CHECK-IN HISTORY */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Check-ins</CardTitle>
                  <CardDescription>
                    Latest check-ins for{" "}
                    {events.find((e) => e._id === selectedEvent)?.title ||
                      "selected event"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckInHistory eventId={selectedEvent} />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

/* ---------------- SMALL HELPER COMPONENT ---------------- */
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
