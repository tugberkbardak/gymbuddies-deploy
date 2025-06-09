"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Loader2, MapPin, Calendar, Building2, ExternalLink, Trophy, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

interface AttendanceUser {
  clerkId?: string
  username?: string
  firstName?: string
  lastName?: string
  profileImage?: string
  profileImageUrl?: string
}

interface Attendance {
  _id: string
  user?: AttendanceUser
  createdAt: string
  date?: string
  gymName?: string
  location?: string
  coordinates?: { lat: number; lng: number }
  image?: string
}

interface LeaderboardUser {
  _id?: string
  clerkId?: string
  username?: string
  firstName?: string
  lastName?: string
  profileImage?: string
  profileImageUrl?: string
  attendanceCount: number
  currentStreak: number
}

export function GlobalTab() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const lastAttendanceRef = useRef<HTMLDivElement | null>(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)
  const [topUserIds, setTopUserIds] = useState<string[]>([])

  const fetchAttendances = async (pageNum = 1, append = false) => {
    try {
      const loadingState = append ? setIsLoadingMore : setIsLoading
      loadingState(true)
      setError(null)

      const response = await fetch(`/api/attendance/global?page=${pageNum}&limit=10`)

      if (!response.ok) {
        throw new Error(`Failed to fetch global feed: ${response.statusText}`)
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
        throw new Error(data.error || "Failed to fetch global feed")
      }
    } catch (err) {
      console.error("Error fetching global feed:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch global feed")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true)
      const response = await fetch("/api/users/leaderboard")

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`)
      }

      const data = await response.json()
      
      // The API returns an array directly, not wrapped in success/data
      if (Array.isArray(data)) {
        setLeaderboardUsers(data)
        // Store the top 3 users' IDs for highlighting (use _id as fallback)
        setTopUserIds(data.slice(0, 3).map((user: LeaderboardUser) => user.clerkId || user._id || ""))
      } else {
        throw new Error("Invalid leaderboard response format")
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }

  // Helper function to get user display name
  const getUserDisplayName = (user?: AttendanceUser) => {
    if (!user) return "Unknown User"
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.username || "Unknown User"
  }

  // Helper function to get user profile image
  const getUserProfileImage = (user?: AttendanceUser | LeaderboardUser) => {
    return user?.profileImageUrl || user?.profileImage
  }

  // Helper function to get user ID for linking
  const getUserId = (user?: AttendanceUser) => {
    return user?.clerkId || user?.username || ""
  }

  // Initial load
  useEffect(() => {
    fetchAttendances()
  }, [])

  // Fetch leaderboard when it's shown
  useEffect(() => {
    if (showLeaderboard) {
      fetchLeaderboard()
    }
  }, [showLeaderboard])

  // Add an event listener to refresh the data when visibility changes
  useEffect(() => {
    // Function to handle visibility changes
    const handleVisibilityChange = () => {
      console.log("Global feed refresh triggered")
      // Reset to page 1 and fetch fresh data
      setPage(1)
      fetchAttendances(1, false)
    }

    // Add event listener
    window.addEventListener("attendance-visibility-changed", handleVisibilityChange)

    // Clean up
    return () => {
      window.removeEventListener("attendance-visibility-changed", handleVisibilityChange)
    }
  }, [])

  // Setup intersection observer for infinite scrolling
  const lastAttendanceCallback = useCallback(
    (node: HTMLDivElement | null) => {
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

  const getMapLink = (coordinates: { lat: number; lng: number }) => {
    if (coordinates) {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    }
    return "#"
  }

  if (isLoading) {
    return (
      <LoadingSkeleton 
        variant="list"
        className="space-y-4"
      />
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Unable to load global feed</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchAttendances()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Global Feed</h2>
        <Button
          variant={showLeaderboard ? "default" : "outline"}
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          {showLeaderboard ? "Show Feed" : "Leaderboard"}
        </Button>
      </div>

      {showLeaderboard ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Gym Enthusiasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingLeaderboard ? (
              <LoadingSkeleton variant="list" />
            ) : (
              <div className="space-y-4">
                {leaderboardUsers.map((user, index) => (
                  <div key={user._id || user.clerkId || index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                              ? "bg-gray-400 text-black"
                              : index === 2
                                ? "bg-amber-600 text-white"
                                : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {index < 3 ? <Crown className="h-4 w-4" /> : index + 1}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getUserProfileImage(user)} alt={getUserDisplayName(user)} />
                        <AvatarFallback>{getUserDisplayName(user).charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getUserDisplayName(user)}</p>
                        {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.attendanceCount} gym sessions</p>
                    </div>
                    <Badge variant="secondary">{user.currentStreak} streak</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {attendances.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No global activity found</p>
            </div>
          ) : (
            attendances.map((attendance, index) => {
              const isLastItem = index === attendances.length - 1
              const userId = getUserId(attendance.user)
              const isTopUser = topUserIds.includes(userId)

              return (
                <div
                  key={attendance._id}
                  ref={isLastItem ? lastAttendanceCallback : null}
                  className={`p-4 rounded-lg border transition-colors ${
                    isTopUser ? "bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border-yellow-500/20" : "bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={getUserProfileImage(attendance.user)} alt={getUserDisplayName(attendance.user)} />
                        <AvatarFallback>{getUserDisplayName(attendance.user).charAt(0)}</AvatarFallback>
                      </Avatar>
                      {isTopUser && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="h-3 w-3 text-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${userId}`}
                          className="font-medium hover:underline truncate"
                        >
                          {getUserDisplayName(attendance.user)}
                        </Link>
                        {isTopUser && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                        <span className="text-sm text-muted-foreground">checked in</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(attendance.createdAt || attendance.date || Date.now()), "MMM d, h:mm a")}</span>
                        </div>
                      </div>

                      {attendance.gymName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{attendance.gymName}</span>
                        </div>
                      )}

                      {attendance.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{attendance.location}</span>
                          {attendance.coordinates && (
                            <Link
                              href={getMapLink(attendance.coordinates)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      )}

                      {attendance.image && (
                        <div className="mt-2">
                          <Image
                            src={attendance.image}
                            alt="Gym session"
                            width={300}
                            height={200}
                            className="rounded-lg object-cover max-w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <LoadingSkeleton variant="default" title="Loading more..." />
            </div>
          )}

          {!hasMore && attendances.length > 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">You've reached the end of the global feed</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
