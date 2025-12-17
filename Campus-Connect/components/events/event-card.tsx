import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Event } from "@/lib/api"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const registered = event.registeredCount || 0
  const spotsLeft = event.capacity - registered
  const isAlmostFull = spotsLeft <= event.capacity * 0.1
  
  // Format date and time
  const startDate = new Date(event.startTime)
  const formattedDate = startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  const formattedTime = startDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })

  // Get organizer name
  const organizerName = typeof event.organizerId === 'object' && event.organizerId 
    ? event.organizerId.name 
    : 'Campus Events'

  return (
    <Card className="overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300 bg-card border-border/50">
      <div className="relative h-48">
        <Image 
          src={event.coverImage || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover" 
        />
        <div className="absolute top-4 right-4">
          {!event.isPaid || event.price === 0 ? (
            <Badge className="bg-green-500/90 text-white rounded-full px-3 py-1">Free</Badge>
          ) : (
            <Badge className="bg-primary/90 text-primary-foreground rounded-full px-3 py-1">${event.price}</Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-4 p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {event.category && (
            <Badge
              variant="secondary"
              className="text-xs rounded-full px-2 py-1 bg-primary/10 text-primary border-0 capitalize"
            >
              {event.category}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="text-xs rounded-full px-2 py-1 bg-muted text-muted-foreground border-0 capitalize"
          >
            {event.status}
          </Badge>
        </div>
        <CardTitle className="text-lg font-medium line-clamp-2 leading-tight">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-muted-foreground leading-relaxed">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              {formattedDate} at {formattedTime}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.venue || event.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {registered}/{event.capacity} registered
              {isAlmostFull && <span className="text-orange-500 ml-1">(Almost full!)</span>}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">by {organizerName}</p>
          <div className="flex space-x-2">
            <Link href={`/events/${event._id}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4 border-border/50 hover:bg-accent/50 bg-transparent"
              >
                Details
              </Button>
            </Link>
            <Link href={`/events/${event._id}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full px-4">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
