import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Building2 } from "lucide-react"

// Mock data - would come from database in real implementation
const attendanceData = [
  {
    id: 1,
    date: "Today, 9:30 AM",
    gymName: "Fitness Center Downtown",
    location: "123 Main St, New York, NY 10001",
    coordinates: { lat: 40.7128, lng: -74.006 },
    points: 2,
    notes: "Great leg day! Increased my squat PR by 10 pounds.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    date: "Yesterday, 6:15 PM",
    gymName: "Gold's Gym",
    location: "456 Park Ave, New York, NY 10022",
    coordinates: { lat: 40.758, lng: -73.9855 },
    points: 1,
    notes: "Quick cardio session after work.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    date: "March 13, 7:00 AM",
    gymName: "Planet Fitness",
    location: "789 Broadway, New York, NY 10003",
    coordinates: { lat: 40.7308, lng: -73.9973 },
    points: 2,
    notes: "Morning workout focusing on upper body.",
    image: "/placeholder.svg?height=200&width=400",
  },
]

export function AttendanceList() {
  const getMapLink = (coordinates: { lat: number; lng: number }) => {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Attendance</h3>

      {attendanceData.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardDescription>{item.date}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardDescription>{item.gymName}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <CardDescription className="flex items-center flex-wrap">
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
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="mt-1 sm:mt-0 self-start">
                {item.points} {item.points === 1 ? "Point" : "Points"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative aspect-video overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image || "/placeholder.svg"}
                alt={`Gym visit at ${item.gymName}`}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-sm">{item.notes}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

