"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, DollarSign, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Event {
  id: string
  title: string
  date: string
  time: string
  venue: string
  price: number
  capacity: number
  registered: number
}

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (registrationId: string) => void
  event: Event
}

export function RegistrationModal({ isOpen, onClose, onSuccess, event }: RegistrationModalProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dietaryRestrictions: "",
    emergencyContact: "",
    agreeToTerms: false,
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (event.price === 0) {
      // Free event - skip payment step
      handleSubmit()
    } else {
      // Redirect to payment page
      router.push(`/payment/${event.id}`)
      onClose()
    }
  }

  const [registrationId, setRegistrationId] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await api.registerForEvent(event.id)
      const registration = (result as any).data || result
      setRegistrationId(registration._id)
      setStep(3)
    } catch (e) {
      // fallback UI feedback could be added (toast)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (step === 3 && registrationId) {
      onSuccess(registrationId)
    }
    onClose()
    setStep(1)
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dietaryRestrictions: "",
      emergencyContact: "",
      agreeToTerms: false,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Register for Event</DialogTitle>
              <DialogDescription>Please fill in your details to register for this event</DialogDescription>
            </DialogHeader>

            {/* Event Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">{event.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.date} at {event.time}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{event.price === 0 ? "Free" : `$${event.price}`}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Registration Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Restrictions (Optional)</Label>
                <Textarea
                  id="dietary"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                  placeholder="Please let us know about any dietary restrictions or allergies"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact (Optional)</Label>
                <Input
                  id="emergency"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Name and phone number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the event terms and conditions and privacy policy
                </Label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onClose} className="bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms}
                className="bg-primary hover:bg-primary/90"
              >
                {event.price === 0 ? "Register" : "Continue to Payment"}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Registration Successful!</DialogTitle>
              <DialogDescription className="text-center">
                You've successfully registered for the event
              </DialogDescription>
            </DialogHeader>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Ticket className="h-8 w-8 text-green-500" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Welcome to {event.title}!</h3>
                <p className="text-muted-foreground">
                  A confirmation email has been sent to {formData.email} with your ticket and event details.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ticket ID:</span>
                  <span className="font-mono">TKT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Registration Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                {event.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Amount Paid:</span>
                    <span>${(event.price + 2.5).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
                  View My Tickets
                </Button>
                <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
                  Continue Browsing Events
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
