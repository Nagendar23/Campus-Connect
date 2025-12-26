"use client"

import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MapPin, Download, Ticket, Mail } from "lucide-react"

const mockUser = {
  name: "John Doe",
  email: "john.doe@university.edu",
  role: "student" as const,
}

interface PaymentSuccessProps {
  event: {
    id: string
    title: string
    date: string
    time: string
    venue: string
    organizer: string
  }
  paymentAmount: number
  onContinue: () => void
}

export function PaymentSuccess({ event, paymentAmount, onContinue }: PaymentSuccessProps) {
  const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const ticketId = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={mockUser} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-500">Payment Successful!</h1>
                <p className="text-muted-foreground">Your registration is confirmed</p>
              </div>
            </div>

            {/* Payment Details */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-b border-green-500/20">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription>Registration confirmed and ticket generated</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Event Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.date}</p>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-sm text-muted-foreground">Event Location</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket ID</p>
                      <p className="font-mono font-medium">{ticketId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="font-mono font-medium">{transactionId}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Amount Paid</span>
                    <span className="font-semibold">${paymentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Payment Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Payment Method</span>
                    <span>•••• •••• •••• 4242</span>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <h3 className="font-semibold">What's Next?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Mail className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Confirmation Email Sent</p>
                        <p className="text-sm text-muted-foreground">
                          Check your email for the confirmation and ticket details
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Ticket className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Digital Ticket Ready</p>
                        <p className="text-sm text-muted-foreground">Your QR code ticket is ready for event check-in</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Event Reminder</p>
                        <p className="text-sm text-muted-foreground">
                          You'll receive a reminder 24 hours before the event
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 bg-primary hover:bg-primary/90">
                <Ticket className="mr-2 h-4 w-4" />
                View My Ticket
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </div>

            <div className="text-center">
              <Button onClick={onContinue} variant="outline" className="bg-transparent">
                Continue to My Events
              </Button>
            </div>

            {/* Support Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Need help? Contact the event organizer: {event.organizer}</p>
              <p>For payment issues, contact our support team</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
