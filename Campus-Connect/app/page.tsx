import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, QrCode, CreditCard, MessageSquare, Award as IdCard, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Campus Connect</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            University Event Management
          </Badge>
          <h1 className="text-5xl md:text-7xl font-light text-balance mb-8 tracking-tight">
            Campus Events
            <span className="text-primary block font-normal">Made Simple</span>
          </h1>
          <p className="text-lg text-muted-foreground text-balance mb-12 max-w-xl mx-auto leading-relaxed">
            Discover, register, and manage campus events with elegant simplicity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup?role=student">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-full">
                Join as Student
              </Button>
            </Link>
            <Link href="/auth/signup?role=organizer">
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-accent/50 px-8 py-3 rounded-full bg-transparent"
              >
                Become Organizer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4 tracking-tight">Essential Features</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Everything you need, nothing you don't</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">Event Discovery</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Browse campus events with smart filtering and personalized recommendations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">QR Check-In</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Instant event check-in with QR codes. No queues, no hassle
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">Secure Payments</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Integrated payment processing with instant confirmation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">Event Feedback</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Rate and review events to improve future experiences
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <IdCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">Digital ID</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Your student ID digitized with QR verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-300 p-6">
              <CardHeader className="p-0 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-medium">Organizer Tools</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Complete event management with analytics and insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-light mb-4 tracking-tight">Ready to start?</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Join the modern way to manage campus events
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signup?role=student">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-full">
                    Get Started
                  </Button>
                </Link>
                <Link href="/auth/signup?role=organizer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-border hover:bg-accent/50 px-8 py-3 rounded-full bg-transparent"
                  >
                    Start Organizing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Campus Connect</span>
          </div>
          <p className="text-muted-foreground">© 2025 Campus Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
