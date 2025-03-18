"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Building2, Loader2 } from "lucide-react"
import { getUserAttendance } from "@/actions/attendance-actions"
import { formatDistanceToNow } from "date-fns"

interface Attendance {
  _id: string
  date: string
  gymName: string
  location: string
  coordinates: { lat: number; lng: number }
  points: number
  notes?: string
  image?: string
}

export function AttendanceList() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAttendances() {
      try {
        const result = await getUserAttendance(1, 10)
        setAttendances(result.attendances)
      } catch (err) {
        console.error("Error fetching attendances:", err)
        setError("Failed to load attendance records")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendances()
  }, [])

  const getMapLink = (coordinates: { lat: number; lng: number }) => {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    )
  }

  if (attendances.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
        <p className="text-muted-foreground">
          You haven't recorded any gym visits yet. Click "Record Attendance" to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Attendance</h3>

      {attendances.map((item) => (
        <Card key={item._id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardDescription>{formatDate(item.date)}</CardDescription>
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
                src={item.image || "/placeholder.svg?height=200&width=400"}
                alt={`Gym visit at ${item.gymName}`}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-sm">{item.notes || "No notes for this workout."}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

