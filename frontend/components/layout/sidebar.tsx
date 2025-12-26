"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Home,
  Ticket,
  CreditCard,
  MessageSquare,
  Award as IdCard,
  Plus,
  QrCode,
  BarChart3,
  Users,
  UserCircle,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  role: "student" | "organizer"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const studentNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/events", label: "All Events", icon: Calendar },
    { href: "/my-events", label: "My Events", icon: Ticket },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/id-card", label: "Digital ID", icon: IdCard },
  ]

  const organizerNavItems = [
    { href: "/organizer", label: "Dashboard", icon: Home },
    { href: "/organizer/events", label: "My Events", icon: Calendar },
    { href: "/organizer/create", label: "Create Event", icon: Plus },
    { href: "/organizer/scanner", label: "QR Scanner", icon: QrCode },
    { href: "/organizer/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/organizer/attendees", label: "Attendees", icon: Users },
    { href: "/organizer/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/organizer/payments", label: "Payments", icon: CreditCard },
    { href: "/organizer/account", label: "Account", icon: UserCircle },
  ]

  const navItems = role === "student" ? studentNavItems : organizerNavItems

  return (
    <div className="w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Campus Events</h2>
            <Badge variant="secondary" className="text-xs">
              {role}
            </Badge>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-accent text-accent-foreground")}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
