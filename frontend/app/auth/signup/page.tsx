"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Mail, Lock, User, Building, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { handleApiError } from "@/lib/error-handler"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Student form state
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const [studentConfirmPassword, setStudentConfirmPassword] = useState("")
  
  // Organizer form state
  const [organizerName, setOrganizerName] = useState("")
  const [organizerEmail, setOrganizerEmail] = useState("")
  const [organizerPassword, setOrganizerPassword] = useState("")
  const [organizerConfirmPassword, setOrganizerConfirmPassword] = useState("")
  
  // Volunteer form state
  const [volunteerName, setVolunteerName] = useState("")
  const [volunteerEmail, setVolunteerEmail] = useState("")
  const [volunteerPassword, setVolunteerPassword] = useState("")
  const [volunteerConfirmPassword, setVolunteerConfirmPassword] = useState("")

  // Sponsor form state
  const [sponsorName, setSponsorName] = useState("")
  const [sponsorEmail, setSponsorEmail] = useState("")
  const [sponsorPassword, setSponsorPassword] = useState("")
  const [sponsorConfirmPassword, setSponsorConfirmPassword] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") as "student" | "organizer" | "volunteer" | "sponsor" | null
  const { signup } = useAuth()

  const handleSignup = async (e: FormEvent, role: "student" | "organizer" | "volunteer" | "sponsor") => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const name = role === "student" ? studentName : role === "organizer" ? organizerName : role === "volunteer" ? volunteerName : sponsorName
      const email = role === "student" ? studentEmail : role === "organizer" ? organizerEmail : role === "volunteer" ? volunteerEmail : sponsorEmail
      const password = role === "student" ? studentPassword : role === "organizer" ? organizerPassword : role === "volunteer" ? volunteerPassword : sponsorPassword
      const confirmPassword =
        role === "student" ? studentConfirmPassword : role === "organizer" ? organizerConfirmPassword : role === "volunteer" ? volunteerConfirmPassword : sponsorConfirmPassword

      // Validation
      if (!name.trim()) {
        setError("Please enter your full name")
        setIsLoading(false)
        return
      }

      if (!email.trim()) {
        setError("Please enter your email")
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      await signup(name, email, password, role)

      // Redirect based on role
      if (role === "student") {
        router.push("/dashboard")
      } else if (role === "organizer") {
        router.push("/organizer")
      } else if (role === "volunteer") {
        router.push("/volunteer")
      } else {
        router.push("/sponsor")
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(handleApiError(err));
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Campus Events</span>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Join the campus event community</p>
        </div>

        <Tabs defaultValue={defaultRole || "student"} className="w-full">
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

          {/* Student Signup */}
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Registration</CardTitle>
                <CardDescription>Create your student account to discover and join events</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleSignup(e, "student")} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@university.edu"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={studentConfirmPassword}
                      onChange={(e) => setStudentConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Student Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteer Signup */}
          <TabsContent value="volunteer">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Registration</CardTitle>
                <CardDescription>Create your volunteer account to apply for events and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleSignup(e, "volunteer")} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={volunteerName}
                      onChange={(e) => setVolunteerName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={volunteerEmail}
                      onChange={(e) => setVolunteerEmail(e.target.value)}
                      placeholder="volunteer@university.edu"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={volunteerPassword}
                      onChange={(e) => setVolunteerPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={volunteerConfirmPassword}
                      onChange={(e) => setVolunteerConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Volunteer Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsor Signup */}
          <TabsContent value="sponsor">
            <Card>
              <CardHeader>
                <CardTitle>Sponsor Registration</CardTitle>
                <CardDescription>Create your sponsor account to discover events and sponsor packages</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleSignup(e, "sponsor")} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Organization / Name</Label>
                    <Input
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="Acme Corp"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={sponsorEmail}
                      onChange={(e) => setSponsorEmail(e.target.value)}
                      placeholder="sponsor@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={sponsorPassword}
                      onChange={(e) => setSponsorPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={sponsorConfirmPassword}
                      onChange={(e) => setSponsorConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Sponsor Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizer Signup */}
          <TabsContent value="organizer">
            <Card>
              <CardHeader>
                <CardTitle>Organizer Registration</CardTitle>
                <CardDescription>Create your organizer account to manage and create events</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={(e) => handleSignup(e, "organizer")} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name / Organization</Label>
                    <Input
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder="Student Activities Office"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={organizerEmail}
                      onChange={(e) => setOrganizerEmail(e.target.value)}
                      placeholder="organizer@university.edu"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={organizerPassword}
                      onChange={(e) => setOrganizerPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={organizerConfirmPassword}
                      onChange={(e) => setOrganizerConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Organizer Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
