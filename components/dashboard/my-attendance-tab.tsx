"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2, MapPin, Calendar, Building2, ExternalLink, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

export function MyAttendanceTab() {
  const [attendances, setAttendances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [updatingVisibility, setUpdatingVisibility] = useState({})
  const observer = useRef(null)
  const lastAttendanceRef = useRef(null)

  const fetchAttendances = async (pageNum = 1, append = false) => {
    try {
      const loadingState = append ? setIsLoadingMore : setIsLoading
      loadingState(true)
      setError(null)

      const response = await fetch(`/api/attendance/user?page=${pageNum}&limit=2`)

      if (!response.ok) {
        throw new Error(`Failed to fetch attendances: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        if (append) {
          setAttendances((prev) => [...prev, ...data.data])
        } else {
          setAttendances(data.data)
        }
        setHasMore(data.pagination.hasMore)
      } else {
        throw new Error(data.error || "Failed to fetch attendances")
      }
    } catch (err) {
      console.error("Error fetching attendances:", err)
      setError(err.message || "Failed to fetch attendances")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchAttendances()
  }, [])

  // Setup intersection observer for infinite scrolling
  const lastAttendanceCallback = useCallback(
    (node) => {
      if (isLoadingMore) return

      if (observer.current) {
        observer.current.disconnect()
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreAttendances()
        }
      })

      if (node) {
        observer.current.observe(node)
        lastAttendanceRef.current = node
      }
    },
    [isLoadingMore, hasMore],
  )

  const loadMoreAttendances = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchAttendances(nextPage, true)
    }
  }

  const toggleVisibility = async (attendanceId, isPublic) => {
    setUpdatingVisibility((prev) => ({ ...prev, [attendanceId]: true }))

    try {
      const response = await fetch(`/api/attendance/${attendanceId}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic }),
      })

      if (!response.ok) {
        throw new Error("Failed to update visibility")
      }

      // Update the local state
      setAttendances((prev) => prev.map((item) => (item._id === attendanceId ? { ...item, isPublic } : item)))
    } catch (error) {
      console.error("Error updating visibility:", error)
    } finally {
      setUpdatingVisibility((prev) => ({ ...prev, [attendanceId]: false }))
    }
  }

  const getMapLink = (coordinates) => {
    if (coordinates) {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    }
    return "#"
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
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchAttendances()}>Try Again</Button>
      </div>
    )
  }

  if (attendances.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No attendance records found.</p>
        <p className="text-muted-foreground mt-2">Check in at the gym to start tracking your attendance!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Attendance</h2>

      <div className="space-y-4">
        {attendances.map((attendance, index) => {
          const isLastItem = index === attendances.length - 1
          const formattedDate = format(new Date(attendance.date), "dd.MM.yyyy HH:mm:ss")

          return (
            <div
              key={attendance._id}
              ref={isLastItem ? lastAttendanceCallback : null}
              className="bg-card rounded-lg p-4 border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 md:hidden">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`public-mode-${attendance._id}`}
                          checked={attendance.isPublic}
                          onCheckedChange={(checked) => toggleVisibility(attendance._id, checked)}
                          disabled={updatingVisibility[attendance._id]}
                        />
                        <label htmlFor={`public-mode-${attendance._id}`} className="flex items-center gap-1 text-xs">
                          <Globe className="h-3 w-3" />
                          <span>Public</span>
                        </label>
                      </div>
                      <Badge variant="outline">{attendance.points || 1} Point</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{attendance.gymName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="break-words">{attendance.location}</span>
                    <a
                      href={getMapLink(attendance.coordinates)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="sr-only">View on map</span>
                    </a>
                  </div>

                  {attendance.notes && <p className="text-sm mt-2">{attendance.notes}</p>}

                  {/* Mobile view for image */}
                  {attendance.image && (
                    <div className="mt-2 rounded-md overflow-hidden w-full md:hidden">
                      <Image
                        src={attendance.image || "/placeholder.svg"}
                        alt="Gym attendance"
                        width={800}
                        height={450}
                        className="w-full h-auto object-cover max-h-[300px]"
                      />
                    </div>
                  )}
                </div>

                {/* Desktop view controls and image */}
                <div className="hidden md:flex md:flex-col md:items-end md:gap-4 md:ml-4 md:min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`public-mode-desktop-${attendance._id}`}
                        checked={attendance.isPublic}
                        onCheckedChange={(checked) => toggleVisibility(attendance._id, checked)}
                        disabled={updatingVisibility[attendance._id]}
                      />
                      <label
                        htmlFor={`public-mode-desktop-${attendance._id}`}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Globe className="h-3 w-3" />
                        <span>Public</span>
                      </label>
                    </div>
                    <Badge variant="outline">{attendance.points || 1} Point</Badge>
                  </div>

                  {attendance.image && (
                    <div className="rounded-md overflow-hidden w-full max-w-[200px]">
                      <Image
                        src={attendance.image || "/placeholder.svg"}
                        alt="Gym attendance"
                        width={200}
                        height={150}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!hasMore && attendances.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">You've reached the end!</p>
          </div>
        )}
      </div>
    </div>
  )
}

