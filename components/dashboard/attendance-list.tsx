"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, ExternalLink, Building2, Loader2, AlertCircle } from "lucide-react"
import { getUserAttendance } from "@/actions/attendance-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const AttendanceList = forwardRef(function AttendanceList(props, ref) {
  const [attendanceData, setAttendanceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAttendances = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First try to fetch using the server action
      const result = await getUserAttendance(10, 1)

      if (result && result.attendances) {
        setAttendanceData(result.attendances || [])
      } else {
        // If server action fails, try the API route as fallback
        const response = await fetch("/api/attendance?limit=10&page=1")
        if (!response.ok) {
          throw new Error(`Failed to fetch attendance: ${response.statusText}`)
        }
        const data = await response.json()
        setAttendanceData(data.attendances || [])
      }
    } catch (err) {
      console.error("Error fetching attendance:", err)
      setError("Failed to load attendance data. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  // Expose the refresh method to parent components
  useImperativeHandle(ref, () => ({
    refreshAttendances: fetchAttendances,
  }))

  useEffect(() => {
    fetchAttendances()

    // Set up an interval to refresh the data every minute
    const intervalId = setInterval(fetchAttendances, 60000)

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
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

  if (attendanceData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No attendance records found. Record your first gym visit!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="attendance-list">
      <h3 className="text-lg font-medium">Recent Attendance</h3>

      {attendanceData.map((item) => (
        <Card key={item.id || item._id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardDescription>{new Date(item.date).toLocaleString()}</CardDescription>
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
              <p className="text-sm">{item.notes}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

