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
      <section className="relative py-20 px-4">
        <div className="pointer-events-none absolute -top-16 right-10 h-52 w-52 rounded-full bg-gradient-to-br from-amber-200/60 via-emerald-200/40 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 via-sky-200/40 to-transparent blur-3xl" />
        <div className="container mx-auto grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit text-sm font-medium">
              EventTech for the whole campus
            </Badge>
            <h1 className="text-5xl md:text-7xl font-light text-balance tracking-tight">
              Orchestrate campus
              <span className="block font-semibold text-foreground">events, volunteers, sponsors.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              A single platform for students, organizers, volunteers, and sponsors. Launch events, staff teams, track budgets, and close sponsorships with clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/signup?role=student">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 rounded-full">
                  Join as Student
                </Button>
              </Link>
              <Link href="/auth/signup?role=organizer">
                <Button size="lg" variant="outline" className="border-border hover:bg-accent/50 px-8 py-3 rounded-full bg-transparent">
                  Become Organizer
                </Button>
              </Link>
              <Link href="/auth/signup?role=volunteer">
                <Button size="lg" variant="outline" className="border-border hover:bg-accent/50 px-8 py-3 rounded-full bg-transparent">
                  Volunteer
                </Button>
              </Link>
              <Link href="/auth/signup?role=sponsor">
                <Button size="lg" variant="outline" className="border-border hover:bg-accent/50 px-8 py-3 rounded-full bg-transparent">
                  Sponsor
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-white">This week</CardTitle>
                <CardDescription className="text-white/70">Live campus activity</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Events scheduled</span>
                  <span className="font-semibold">42</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Volunteer shifts</span>
                  <span className="font-semibold">128</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Sponsor leads</span>
                  <span className="font-semibold">18</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Organizer command deck</CardTitle>
                <CardDescription>Budgets, tasks, and certificates.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Real-time analytics and team coordination.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-4" id="roles">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-3 tracking-tight">Built for every role</h2>
            <p className="text-muted-foreground text-lg">Four personas, one connected workflow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-gradient-to-br from-white to-emerald-50">
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>Discover events, hold passes, and share feedback.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-white to-amber-50">
              <CardHeader>
                <CardTitle>Organizers</CardTitle>
                <CardDescription>Launch events, manage budgets, and lead teams.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-white to-rose-50">
              <CardHeader>
                <CardTitle>Volunteers</CardTitle>
                <CardDescription>Claim shifts, track tasks, and earn achievements.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-gradient-to-br from-white to-sky-50">
              <CardHeader>
                <CardTitle>Sponsors</CardTitle>
                <CardDescription>Match with events, activate packages, prove impact.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4" id="features">
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
                <CardTitle className="text-lg font-medium">Volunteer & Sponsor Ops</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Match volunteers, assign tasks, activate sponsors, and track ROI
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-foreground/5 to-foreground/10 border-foreground/10 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-light mb-4 tracking-tight">Ready to activate your campus?</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Bring every role into one coordinated experience
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signup?role=student">
                  <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 rounded-full">
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
