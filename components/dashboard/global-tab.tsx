import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Building2 } from "lucide-react"

// Mock data - would come from database in real implementation
const globalAttendanceData = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Today, 9:30 AM",
    gymName: "Fitness Center Downtown",
    location: "New York, NY 10001",
    coordinates: { lat: 40.7128, lng: -74.006 },
    points: 2,
    notes: "Great leg day! Increased my squat PR by 10 pounds.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      username: "mikechen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Today, 8:15 AM",
    gymName: "Gold's Gym",
    location: "Los Angeles, CA 90001",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    points: 2,
    notes: "Morning workout focusing on chest and triceps.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    user: {
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Yesterday, 6:30 PM",
    gymName: "Fitness First",
    location: "London, UK",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    points: 1,
    notes: "Evening cardio session after work.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    user: {
      name: "Alex Rodriguez",
      username: "alexr",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "Yesterday, 7:00 AM",
    gymName: "Planet Fitness",
    location: "Chicago, IL 60007",
    coordinates: { lat: 41.8781, lng: -87.6298 },
    points: 2,
    notes: "Early morning workout focusing on back and biceps.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    user: {
      name: "Sophia Kim",
      username: "sophiak",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "2 days ago, 5:45 PM",
    gymName: "24 Hour Fitness",
    location: "San Francisco, CA 94016",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    points: 2,
    notes: "Great HIIT session today!",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export function GlobalTab() {
  const getMapLink = (coordinates: { lat: number; lng: number }) => {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Global Activity</h2>
        <Badge variant="outline">Live Updates</Badge>
      </div>

      <p className="text-muted-foreground">
        See gym attendance from GymBuddies users around the world. Get inspired by the global community!
      </p>

      <div className="space-y-4">
        {globalAttendanceData.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.user.avatar} alt={item.user.name} />
                    <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{item.user.name}</CardTitle>
                    <CardDescription>@{item.user.username}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="self-start">
                  {item.points} {item.points === 1 ? "Point" : "Points"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.gymName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex items-center flex-wrap">
                      <span className="mr-1">{item.location}</span>
                      <a
                        href={getMapLink(item.coordinates)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="sr-only">View on map</span>
                      </a>
                    </span>
                  </div>
                </div>
                <p className="text-sm">{item.notes}</p>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={`Gym visit at ${item.gymName}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

