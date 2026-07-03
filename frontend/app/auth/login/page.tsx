"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Mail, Lock, User, Building, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { handleApiError } from "@/lib/error-handler"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const [organizerEmail, setOrganizerEmail] = useState("")
  const [organizerPassword, setOrganizerPassword] = useState("")
  const [volunteerEmail, setVolunteerEmail] = useState("")
  const [volunteerPassword, setVolunteerPassword] = useState("")
  const [sponsorEmail, setSponsorEmail] = useState("")
  const [sponsorPassword, setSponsorPassword] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: FormEvent, role: "student" | "organizer" | "volunteer" | "sponsor") => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const email =
        role === "student"
          ? studentEmail
          : role === "organizer"
          ? organizerEmail
          : role === "volunteer"
          ? volunteerEmail
          : sponsorEmail
      const password =
        role === "student"
          ? studentPassword
          : role === "organizer"
          ? organizerPassword
          : role === "volunteer"
          ? volunteerPassword
          : sponsorPassword

      await login(email, password)

      // Redirect based on role - the auth context will handle setting the user
      if (role === "student") router.push("/dashboard")
      if (role === "organizer") router.push("/organizer")
      if (role === "volunteer") router.push("/volunteer")
      if (role === "sponsor") router.push("/sponsor")
    } catch (err: any) {
      console.error('Login error:', err);
      setError(handleApiError(err));
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-amber-200/60 via-emerald-200/40 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-40 h-72 w-72 rounded-full bg-gradient-to-br from-rose-200/50 via-sky-200/40 to-transparent blur-3xl" />
        <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center space-y-8">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-foreground flex items-center justify-center">
                <Calendar className="h-6 w-6 text-background" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Campus Connect</p>
                <h1 className="text-4xl font-semibold">Welcome back</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-xl">
              Sign in to manage registrations, staffing, sponsorships, and experiences across your campus event ecosystem.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Students</CardTitle>
                  <CardDescription className="text-white/70">Find events and track passes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70">Your campus calendar, personalized.</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-white to-emerald-50">
                <CardHeader>
                  <CardTitle>Organizers</CardTitle>
                  <CardDescription>Launch events, track ROI, and orchestrate teams.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Tools for teams running events.</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-white to-amber-50">
                <CardHeader>
                  <CardTitle>Volunteers</CardTitle>
                  <CardDescription>Claim shifts, manage tasks, and build leadership score.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Stay aligned with assignments and achievements.</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-white to-sky-50">
                <CardHeader>
                  <CardTitle>Sponsors</CardTitle>
                  <CardDescription>Match with events, activate packages, track impact.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Grow campus presence with measurable ROI.</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Unified access for students, organizers, volunteers, and sponsors.
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Sign in</h2>
                <p className="text-muted-foreground">Choose your workspace and continue.</p>
              </div>
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="student" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Student</span>
                  </TabsTrigger>
                  <TabsTrigger value="organizer" className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Organizer</span>
                  </TabsTrigger>
                  <TabsTrigger value="volunteer" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Volunteer</span>
                  </TabsTrigger>
                  <TabsTrigger value="sponsor" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Sponsor</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                    <CardHeader>
                      <CardTitle>Student Login</CardTitle>
                      <CardDescription>Access your student dashboard and events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                      <form onSubmit={(e) => handleLogin(e, "student")} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="student-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="student-email" 
                              type="email"
                              placeholder="student@university.edu" 
                              className="pl-10"
                              value={studentEmail}
                              onChange={(e) => setStudentEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="student-password" 
                              type="password" 
                              className="pl-10"
                              value={studentPassword}
                              onChange={(e) => setStudentPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign in as Student"}
                        </Button>
                        <div className="text-center">
                          <Button type="button" variant="link" className="text-sm text-muted-foreground">
                            Forgot your password?
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="organizer">
                  <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                    <CardHeader>
                      <CardTitle>Organizer Login</CardTitle>
                      <CardDescription>Access your organizer dashboard and tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                      <form onSubmit={(e) => handleLogin(e, "organizer")} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="organizer-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="organizer-email" 
                              type="email" 
                              placeholder="organizer@university.edu" 
                              className="pl-10"
                              value={organizerEmail}
                              onChange={(e) => setOrganizerEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organizer-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="organizer-password" 
                              type="password" 
                              className="pl-10"
                              value={organizerPassword}
                              onChange={(e) => setOrganizerPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign in as Organizer"}
                        </Button>
                        <div className="text-center">
                          <Button type="button" variant="link" className="text-sm text-muted-foreground">
                            Forgot your password?
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="volunteer">
                  <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                    <CardHeader>
                      <CardTitle>Volunteer Login</CardTitle>
                      <CardDescription>Access your volunteer dashboard and tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                      <form onSubmit={(e) => handleLogin(e, "volunteer")} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="volunteer-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="volunteer-email"
                              type="email"
                              placeholder="volunteer@university.edu"
                              className="pl-10"
                              value={volunteerEmail}
                              onChange={(e) => setVolunteerEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="volunteer-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="volunteer-password"
                              type="password"
                              className="pl-10"
                              value={volunteerPassword}
                              onChange={(e) => setVolunteerPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign in as Volunteer"}
                        </Button>
                        <div className="text-center">
                          <Button type="button" variant="link" className="text-sm text-muted-foreground">
                            Forgot your password?
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sponsor">
                  <Card className="border-0 bg-gradient-to-br from-white to-slate-50">
                    <CardHeader>
                      <CardTitle>Sponsor Login</CardTitle>
                      <CardDescription>Access your sponsor dashboard and deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{error}</span>
                        </div>
                      )}
                      <form onSubmit={(e) => handleLogin(e, "sponsor")} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="sponsor-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="sponsor-email"
                              type="email"
                              placeholder="sponsor@company.com"
                              className="pl-10"
                              value={sponsorEmail}
                              onChange={(e) => setSponsorEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sponsor-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="sponsor-password"
                              type="password"
                              className="pl-10"
                              value={sponsorPassword}
                              onChange={(e) => setSponsorPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign in as Sponsor"}
                        </Button>
                        <div className="text-center">
                          <Button type="button" variant="link" className="text-sm text-muted-foreground">
                            Forgot your password?
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
