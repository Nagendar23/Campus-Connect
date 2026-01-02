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
import { api, type Event as ApiEvent, getAccessToken } from "@/lib/api"

export default function QRScannerPage() {
  const { user, loading: authLoading } = useAuth()

  const [events, setEvents] = useState<ApiEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [manualTicketId, setManualTicketId] = useState("")
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

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
    if (!user || authLoading) return

    const loadEvents = async () => {
      try {
        setLoading(true)
        setAuthError(null) // Clear any previous auth errors
        
        const accessToken = getAccessToken();
        if (!accessToken) {
          setAuthError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }
        
        const res = await api.getOrganizerEvents(user._id, {
          limit: 100,
        })

        const items = (res.data || []).filter(e => e.status === "published")
        setEvents(items)

        if (items.length > 0) {
          setSelectedEvent(items[0]._id)
        }
      } catch (err: any) {
        console.error("Failed to load events:", err)
        
        // Check if it's an authentication error
        if (err?.status === 401 || err?.code === 'UNAUTHENTICATED' || err?.code === 'INVALID_TOKEN') {
          setAuthError('Authentication failed. Please refresh the page and log in again.');
        }
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user, authLoading])

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
    console.log('[Scanner] Handle QR scan result called');
    console.log('[Scanner] User state:', { hasUser: !!user, userId: user?._id, role: user?.role });
    console.log('[Scanner] Auth loading:', authLoading);
    console.log('[Scanner] Token preview:', token.substring(0, 30) + '...');
    
    // Check if user is authenticated
    if (!user) {
      console.error('[Scanner] No user object available');
      setAuthError('You are not logged in. Please refresh the page and log in again.');
      setScanResult({
        success: false,
        message: 'Authentication error. Please log in again.',
      });
      return;
    }

    const accessToken = getAccessToken();
    console.log('[Scanner] Access token:', accessToken ? 'Present' : 'Missing');
    
    if (!accessToken) {
      console.error('[Scanner] No access token available');
      setAuthError('Session expired. Please log in again.');
      setScanResult({
        success: false,
        message: 'Session expired. Please log in again.',
      });
      return;
    }

    try {
      console.log('[Scanner] Attempting to scan QR code');
      const res = await api.scanQRCode({ token })
      console.log('[Scanner] Check-in successful:', res);

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
      console.error('[Scanner] Check-in failed:', err);
      console.error('[Scanner] Error details:', {
        status: err?.status,
        code: err?.code,
        message: err?.message,
        data: err?.data
      });
      
      let errorMessage = "Check-in failed";
      
      // Extract user-friendly error message
      if (err?.getUserMessage) {
        errorMessage = err.getUserMessage();
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Check for authentication errors - be more specific
      const isAuthError = err?.status === 401 && (
                          err?.code === 'UNAUTHENTICATED' || 
                          err?.code === 'INVALID_TOKEN' ||
                          errorMessage.toLowerCase().includes('missing authentication') ||
                          errorMessage.toLowerCase().includes('invalid or expired'));
      
      if (isAuthError) {
        setAuthError('Authentication failed. Please refresh the page and log in again.');
        errorMessage = 'Session expired. Please log in again.';
      }
      
      setScanResult({
        success: false,
        message: errorMessage,
      })
    }

    if (!bulkMode) {
      setTimeout(() => setScanResult(null), 4000)
    }
  }

  /* ---------------- MANUAL CHECK-IN ---------------- */
  const handleManualCheckIn = async () => {
    if (!manualTicketId.trim()) return

    console.log('[Manual Check-in] Starting manual check-in');
    console.log('[Manual Check-in] Ticket ID:', manualTicketId);
    console.log('[Manual Check-in] User state:', { hasUser: !!user, userId: user?._id, role: user?.role });
    console.log('[Manual Check-in] Auth loading:', authLoading);

    // Check if user is authenticated
    if (!user) {
      console.error('[Manual Check-in] No user object available');
      setAuthError('You are not logged in. Please refresh the page and log in again.');
      setScanResult({
        success: false,
        message: 'Authentication error. Please log in again.',
      });
      setTimeout(() => setScanResult(null), 4000);
      return;
    }

    const accessToken = getAccessToken();
    console.log('[Manual Check-in] Access token:', accessToken ? 'Present' : 'Missing');
    
    if (!accessToken) {
      console.error('[Manual Check-in] No access token available');
      setAuthError('Session expired. Please log in again.');
      setScanResult({
        success: false,
        message: 'Session expired. Please log in again.',
      });
      setTimeout(() => setScanResult(null), 4000);
      return;
    }

    try {
      console.log('[Manual Check-in] Fetching ticket QR code');
      const qr = await api.getTicketQRCode(manualTicketId.trim())
      console.log('[Manual Check-in] Got QR token, proceeding to scan');
      await handleScanResult(qr.token)
      setManualTicketId("")
    } catch (err: any) {
      console.error('[Manual Check-in] Failed:', err);
      console.error('[Manual Check-in] Error details:', {
        status: err?.status,
        code: err?.code,
        message: err?.message,
        data: err?.data
      });
      
      let errorMessage = "Invalid ticket";
      
      // Extract user-friendly error message
      if (err?.getUserMessage) {
        errorMessage = err.getUserMessage();
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Check for authentication errors - be more specific  
      const isAuthError = err?.status === 401 && (
                          err?.code === 'UNAUTHENTICATED' || 
                          err?.code === 'INVALID_TOKEN' ||
                          errorMessage.toLowerCase().includes('missing authentication') ||
                          errorMessage.toLowerCase().includes('invalid or expired'));
      
      if (isAuthError) {
        setAuthError('Authentication failed. Please refresh the page and log in again.');
        errorMessage = 'Session expired. Please log in again.';
      }
      
      setScanResult({
        success: false,
        message: errorMessage,
      })
      setTimeout(() => setScanResult(null), 4000)
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

              {/* AUTHENTICATION ERROR ALERT */}
              {authError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-red-500">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-500">Authentication Error</h3>
                      <p className="text-sm text-red-500/90 mt-1">{authError}</p>
                      <Button 
                        onClick={() => window.location.reload()} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
                      >
                        Refresh Page
                      </Button>
                    </div>
                    <button 
                      onClick={() => setAuthError(null)} 
                      className="text-red-500/60 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

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

              {/* MANUAL CHECK-IN */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Manual Check-in
                  </CardTitle>
                  <CardDescription>
                    Enter Ticket ID manually if scanning fails
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Input
                    placeholder="Enter Ticket ID (e.g., TKT-... or MongoID)"
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    disabled={authLoading || loading || !!authError}
                  />
                  <Button 
                    onClick={handleManualCheckIn} 
                    disabled={authLoading || loading || !manualTicketId || !!authError}
                  >
                    Check In
                  </Button>
                </CardContent>
              </Card>

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
                    disabled={authLoading || loading || !!authError || !selectedEvent}
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

                  {!selectedEvent && (
                    <p className="text-sm text-muted-foreground">
                      Please select an event to start scanning
                    </p>
                  )}

                  {isScanning && (
                    <div className="border rounded-lg p-4">
                      <QRScanner onScan={handleScanResult} />
                    </div>
                  )}

                  {scanResult && (
                    <div
                      className={`p-4 rounded ${scanResult.success
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
