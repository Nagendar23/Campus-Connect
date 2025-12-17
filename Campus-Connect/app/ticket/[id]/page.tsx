"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeDisplay } from "@/components/qr/qr-code-display"
import { Calendar, MapPin, Download, Share2, Ticket } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"

interface TicketViewData {
  id: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventVenue: string
  eventAddress: string
  organizer: string
  attendeeName: string
  attendeeEmail: string
  registrationDate: string
  ticketType: string
  price: number
  status: string
  qrData: string
  instructions: string
}

export default function TicketPage() {
  const { user } = useAuth()
  const params = useParams<{ id: string }>()
  const registrationId = params?.id

  const [ticketData, setTicketData] = useState<TicketViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!registrationId || !user) return

    const loadTicket = async () => {
      try {
        setLoading(true)

        const response = await api.getRegistration(registrationId)
        const registration = (response as any).data || response

        const event = registration.eventId
        const startDate = new Date(event.startTime)
        const regDate = new Date(registration.createdAt)

        const formattedDate = startDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })

        const formattedTime = startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })

        const formattedRegDate = regDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })

        const organizerName =
          typeof event.organizerId === "object"
            ? event.organizerId.name
            : "Campus Events"

        setTicketData({
          id: registration._id,
          eventTitle: event.title,
          eventDate: formattedDate,
          eventTime: formattedTime,
          eventVenue: event.venue,
          eventAddress: event.venue,
          organizer: organizerName,
          attendeeName: user.name,
          attendeeEmail: user.email,
          registrationDate: formattedRegDate,
          ticketType: "General Admission",
          price: event.price || 0,
          status: registration.status,
          qrData:
            registration.qrCode ||
            `${registration._id}|${event._id}|${user.email}|${formattedDate}`,
          instructions:
            "Please arrive 15 minutes early for check-in. Bring a valid ID for verification.",
        })
      } catch (error) {
        console.error("Failed to load ticket:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [registrationId, user])

  // ✅ EARLY LOADING RETURN
  if (loading || !ticketData) {
    return (
      <AuthGuard requiredRole="student">
        <div className="min-h-screen bg-background">
          <Navbar
            user={
              user
                ? { name: user.name, email: user.email, role: user.role }
                : undefined
            }
          />
          <div className="container mx-auto px-4 py-10">
            <div className="max-w-2xl mx-auto h-96 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </AuthGuard>
    )
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsDownloading(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket for ${ticketData.eventTitle}`,
        text: `My ticket for ${ticketData.eventTitle}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar
          user={
            user
              ? { name: user.name, email: user.email, role: user.role }
              : undefined
          }
        />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Ticket className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Event Ticket</h1>
              </div>

              <Badge
                className={
                  ticketData.status === "confirmed"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : ""
                }
              >
                {ticketData.status}
              </Badge>
            </div>

            {/* Ticket Card */}
            <Card>
              <CardHeader>
                <CardTitle>{ticketData.eventTitle}</CardTitle>
                <CardDescription>Ticket ID: {ticketData.id}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{ticketData.eventDate}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticketData.eventTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <p>{ticketData.eventVenue}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">{ticketData.attendeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticketData.attendeeEmail}
                    </p>
                  </div>
                </div>

                <div className="text-center border-y py-6">
                  <QRCodeDisplay data={ticketData.qrData} size={200} />
                  <p className="text-sm text-muted-foreground mt-3">
                    Present this QR code at entry
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Registered on</p>
                    <p>{ticketData.registrationDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p>{ticketData.price === 0 ? "Free" : `$${ticketData.price}`}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleDownload} disabled={isDownloading} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Organizer: {ticketData.organizer}
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
