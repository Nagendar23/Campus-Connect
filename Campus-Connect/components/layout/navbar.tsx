"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Bell, User, LogOut, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface NavbarProps {
  user?: {
    name: string
    email: string
    role: "student" | "organizer" | "admin"
    avatarUrl?: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth()

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout()
    }
  }

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={user ? (user.role === "student" ? "/dashboard" : "/organizer") : "/"}
            className="flex items-center space-x-3"
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-light text-foreground tracking-tight">Campus Events</span>
          </Link>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 rounded-full">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    3
                  </Badge>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-accent/50 rounded-full px-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:inline font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border/50">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/id-card" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        View Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/id-card?edit=true" className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Info
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
