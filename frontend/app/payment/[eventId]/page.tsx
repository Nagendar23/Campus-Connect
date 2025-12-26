"use client"

import type React from "react"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PaymentSuccess } from "@/components/payments/payment-success"
import { Calendar, MapPin, CreditCard, Lock, ArrowLeft, Smartphone, Wallet, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

const mockUser = {
  name: "John Doe",
  email: "john.doe@university.edu",
  role: "student" as const,
}

// Mock event data - in real app this would come from API based on [eventId]
const eventData = {
  id: "3",
  title: "Cultural Night Celebration",
  date: "2025-02-25",
  time: "06:00 PM",
  venue: "Campus Plaza",
  organizer: "International Student Association",
  price: 15.0,
  processingFee: 2.5,
  image: "/cultural-celebration-festival.jpg",
}

const savedCards = [
  { id: "1", last4: "4242", brand: "Visa", expiryMonth: "12", expiryYear: "2027" },
  { id: "2", last4: "5555", brand: "Mastercard", expiryMonth: "08", expiryYear: "2026" },
]

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("new-card")
  const [selectedCard, setSelectedCard] = useState("")
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
    saveCard: false,
  })
  const router = useRouter()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const validateForm = () => {
    if (paymentMethod === "new-card") {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
        setError("Please fill in all required card details")
        return false
      }
      if (formData.cardNumber.replace(/\s/g, "").length < 16) {
        setError("Please enter a valid card number")
        return false
      }
    } else if (paymentMethod === "saved-card" && !selectedCard) {
      setError("Please select a saved card")
      return false
    }
    return true
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simulate payment processing with potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 10% chance of payment failure for demo
          if (Math.random() < 0.1) {
            reject(new Error("Payment failed. Please try again."))
          } else {
            resolve(true)
          }
        }, 3000)
      })

      setPaymentComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    router.push("/my-events")
  }

  if (paymentComplete) {
    return (
      <PaymentSuccess
        event={eventData}
        paymentAmount={eventData.price + eventData.processingFee}
        onContinue={handlePaymentSuccess}
      />
    )
  }

  return (
    <AuthGuard requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar user={mockUser} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
              <Link href={`/events/${eventData.id}`}>
                <Button variant="outline" size="icon" className="bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Complete Payment</h1>
                <p className="text-muted-foreground">Secure checkout for your event registration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Method</span>
                    </CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePayment} className="space-y-6">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Payment Method Selection */}
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-4">
                          {/* Saved Cards */}
                          {savedCards.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="saved-card" id="saved-card" />
                                <Label htmlFor="saved-card" className="font-medium">
                                  Use saved card
                                </Label>
                              </div>
                              {paymentMethod === "saved-card" && (
                                <div className="ml-6 space-y-2">
                                  {savedCards.map((card) => (
                                    <div key={card.id} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`card-${card.id}`}
                                        name="selectedCard"
                                        value={card.id}
                                        checked={selectedCard === card.id}
                                        onChange={(e) => setSelectedCard(e.target.value)}
                                        className="w-4 h-4"
                                      />
                                      <Label htmlFor={`card-${card.id}`} className="flex items-center space-x-2">
                                        <CreditCard className="h-4 w-4" />
                                        <span>
                                          {card.brand} •••• {card.last4} ({card.expiryMonth}/{card.expiryYear})
                                        </span>
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* New Card */}
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new-card" id="new-card" />
                            <Label htmlFor="new-card" className="font-medium">
                              Add new card
                            </Label>
                          </div>

                          {/* Digital Wallets */}
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="apple-pay" id="apple-pay" />
                            <Label htmlFor="apple-pay" className="flex items-center space-x-2">
                              <Smartphone className="h-4 w-4" />
                              <span>Apple Pay</span>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="google-pay" id="google-pay" />
                            <Label htmlFor="google-pay" className="flex items-center space-x-2">
                              <Wallet className="h-4 w-4" />
                              <span>Google Pay</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {/* New Card Form */}
                      {paymentMethod === "new-card" && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => {
                                  // Format card number with spaces
                                  const value = e.target.value
                                    .replace(/\s/g, "")
                                    .replace(/(.{4})/g, "$1 ")
                                    .trim()
                                  handleInputChange("cardNumber", value)
                                }}
                                className="pl-10"
                                maxLength={19}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiryDate">Expiry Date *</Label>
                              <Input
                                id="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={(e) => {
                                  // Format expiry date
                                  const value = e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2")
                                  handleInputChange("expiryDate", value)
                                }}
                                maxLength={5}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvv">CVV *</Label>
                              <Input
                                id="cvv"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                                maxLength={4}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card *</Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              value={formData.cardName}
                              onChange={(e) => handleInputChange("cardName", e.target.value)}
                              required
                            />
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="font-semibold">Billing Address</h3>
                            <div className="space-y-2">
                              <Label htmlFor="billingAddress">Address *</Label>
                              <Input
                                id="billingAddress"
                                placeholder="123 Main Street"
                                value={formData.billingAddress}
                                onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                  id="city"
                                  placeholder="New York"
                                  value={formData.city}
                                  onChange={(e) => handleInputChange("city", e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="zipCode">ZIP Code *</Label>
                                <Input
                                  id="zipCode"
                                  placeholder="10001"
                                  value={formData.zipCode}
                                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="saveCard"
                              checked={formData.saveCard}
                              onCheckedChange={(checked) => handleInputChange("saveCard", checked as boolean)}
                            />
                            <Label htmlFor="saveCard" className="text-sm">
                              Save this card for future purchases
                            </Label>
                          </div>
                        </div>
                      )}

                      {/* Digital Wallet Buttons */}
                      {(paymentMethod === "apple-pay" || paymentMethod === "google-pay") && (
                        <div className="border-t pt-4">
                          <Button
                            type="button"
                            className={`w-full ${
                              paymentMethod === "apple-pay"
                                ? "bg-black hover:bg-black/90 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                            onClick={() => {
                              // Simulate digital wallet payment
                              setIsLoading(true)
                              setTimeout(() => {
                                setIsLoading(false)
                                setPaymentComplete(true)
                              }, 2000)
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              "Processing..."
                            ) : (
                              <>
                                {paymentMethod === "apple-pay" ? (
                                  <Smartphone className="mr-2 h-4 w-4" />
                                ) : (
                                  <Wallet className="mr-2 h-4 w-4" />
                                )}
                                Pay with {paymentMethod === "apple-pay" ? "Apple Pay" : "Google Pay"}
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Submit Button for Card Payments */}
                      {(paymentMethod === "new-card" || paymentMethod === "saved-card") && (
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                          {isLoading
                            ? "Processing Payment..."
                            : `Pay $${(eventData.price + eventData.processingFee).toFixed(2)}`}
                        </Button>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>
                        Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">{eventData.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {eventData.date} at {eventData.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{eventData.venue}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Organized by {eventData.organizer}</p>
                    </div>

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Event Ticket</span>
                        <span>${eventData.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Processing Fee</span>
                        <span>${eventData.processingFee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${(eventData.price + eventData.processingFee).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> You will receive a confirmation email with your ticket and QR code after
                        successful payment.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Refund Policy */}
                <Card>
                  <CardHeader>
                    <CardTitle>Refund Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Full refund available up to 48 hours before the event</p>
                      <p>• 50% refund available up to 24 hours before the event</p>
                      <p>• No refunds available within 24 hours of the event</p>
                      <p>• Processing fees are non-refundable</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Security */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• PCI DSS Level 1 compliant payment processing</p>
                      <p>• 256-bit SSL encryption for all transactions</p>
                      <p>• Fraud detection and prevention systems</p>
                      <p>• 24/7 transaction monitoring</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
