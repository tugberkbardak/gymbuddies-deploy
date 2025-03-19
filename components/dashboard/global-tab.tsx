"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Building2, Loader2, AlertCircle } from "lucide-react"
import { getGlobalAttendance } from "@/actions/attendance-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export function GlobalTab() {
  const { toast } = useToast()
  const [globalAttendanceData, setGlobalAttendanceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGlobalAttendances = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getGlobalAttendance(10, 1)
        setGlobalAttendanceData(result.attendances || [])
      } catch (err) {
        console.error("Error fetching global attendance:", err)
        setError("Failed to load global attendance data. Please refresh the page.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGlobalAttendances()
  }, [])

  const getMapLink = (coordinates: { lat: number; lng: number }) => {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (globalAttendanceData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No global attendance records found yet. Be the first to record a gym visit!
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
        {globalAttendanceData.map((item) => (
          <Card key={item.id || item._id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.user?.profileImage} alt={item.user?.username} />
                    <AvatarFallback>{item.user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    {item.user?.username ? (
                      <Link href={`/profile/username/${item.user.username}`} className="hover:underline">
                        <CardTitle className="text-base">
                          {item.user?.firstName || ""} {item.user?.lastName || ""}
                          {!item.user?.firstName && !item.user?.lastName && item.user?.username}
                        </CardTitle>
                      </Link>
                    ) : (
                      <CardTitle className="text-base">
                        {item.user?.firstName || ""} {item.user?.lastName || ""}
                        {!item.user?.firstName && !item.user?.lastName && "User"}
                      </CardTitle>
                    )}
                    <CardDescription>@{item.user?.username || "user"}</CardDescription>
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
                    <span className="text-sm">{new Date(item.date).toLocaleString()}</span>
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

