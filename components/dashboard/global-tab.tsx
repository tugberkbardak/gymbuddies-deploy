"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Building2, Loader2 } from "lucide-react"
import { getGlobalAttendance } from "@/actions/attendance-actions"
import { formatDistanceToNow } from "date-fns"

interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  profileImage?: string
}

interface GlobalAttendance {
  _id: string
  user: User
  date: string
  gymName: string
  location: string
  coordinates: { lat: number; lng: number }
  points: number
  notes?: string
  image?: string
}

export function GlobalTab() {
  const [attendances, setAttendances] = useState<GlobalAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGlobalAttendances() {
      try {
        const result = await getGlobalAttendance(1, 10)
        setAttendances(result.attendances)
      } catch (err) {
        console.error("Error fetching global attendances:", err)
        setError("Failed to load global activity")
      } finally {
        setLoading(false)
      }
    }

    fetchGlobalAttendances()
  }, [])

  const getMapLink = (coordinates: { lat: number; lng: number }) => {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.username
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
        <h3 className="text-lg font-medium mb-2">No Global Activity</h3>
        <p className="text-muted-foreground">
          There are no gym visits recorded yet. Be the first to record your attendance!
        </p>
      </div>
    )
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
        {attendances.map((item) => (
          <Card key={item._id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={item.user.profileImage || "/placeholder.svg?height=40&width=40"}
                      alt={getUserDisplayName(item.user)}
                    />
                    <AvatarFallback>{item.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{getUserDisplayName(item.user)}</CardTitle>
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
                    <span className="text-sm">{formatDate(item.date)}</span>
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
                <p className="text-sm">{item.notes || "No notes for this workout."}</p>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/placeholder.svg?height=200&width=400"}
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

