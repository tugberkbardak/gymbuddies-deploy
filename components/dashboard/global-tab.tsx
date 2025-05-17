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

export function GlobalTab() {
  const [attendances, setAttendances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observer = useRef(null)
  const lastAttendanceRef = useRef(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboardUsers, setLeaderboardUsers] = useState([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)
  // Add a new state variable to track top users' IDs
  const [topUserIds, setTopUserIds] = useState<string[]>([])

  const fetchAttendances = async (pageNum = 1, append = false) => {
    try {
      const loadingState = append ? setIsLoadingMore : setIsLoading
      loadingState(true)
      setError(null)

      const response = await fetch(`/api/attendance/global?page=${pageNum}&limit=2`)

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

  // Fetch leaderboard data
  // Modify the fetchLeaderboard function to also set the top user IDs
  const fetchLeaderboard = async () => {
    try {
      setIsLoadingLeaderboard(true)
      const response = await fetch("/api/users/leaderboard")

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`)
      }

      const data = await response.json()

      // Check if data is an array before setting it
      if (Array.isArray(data)) {
        setLeaderboardUsers(data)

        // Extract the IDs of the top 10 users (or fewer if less than 10)
        const topIds = data.slice(0, 10).map((user) => user._id)
        setTopUserIds(topIds)
      } else {
        console.error("Unexpected leaderboard data format:", data)
        setLeaderboardUsers([])
        setTopUserIds([])
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setLeaderboardUsers([]) // Set empty array on error
      setTopUserIds([])
    } finally {
      setIsLoadingLeaderboard(false)
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold">Global Activity</h2>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm">
            Live Updates
          </Button>
          <Button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            variant="outline"
            className="border-[#40E0D0] text-[#40E0D0] hover:bg-[#40E0D0]/10 hover:text-[#40E0D0]"
          >
            <Trophy className="mr-2 h-4 w-4" />
            {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
          </Button>
        </div>
      </div>

      <p className="text-muted-foreground">
        See gym attendance from GymBuddies users around the world. Get inspired by the global community!
      </p>

      {/* Global Leaderboard */}
      {showLeaderboard && (
        <Card className="border-[#40E0D0]/20">
          <CardHeader className="bg-[#40E0D0]/10">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#40E0D0]" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingLeaderboard ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#40E0D0]" />
              </div>
            ) : leaderboardUsers.length > 0 ? (
              <div className="space-y-4">
                {leaderboardUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-[#40E0D0]/5 transition-colors"
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0
                    ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                          ? "bg-gray-400"
                          : index === 2
                            ? "bg-amber-700"
                            : "bg-[#40E0D0]/20"
                    } 
                    text-white font-bold text-xs`}
                    >
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={user.profileImage || user.profileImageUrl} alt={user.username} />
                      <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/username/${user.username}`}
                        className="font-medium flex items-center gap-1 hover:text-[#40E0D0] hover:underline truncate"
                      >
                        {user.firstName} {user.lastName}
                        {index < 10 && <Crown className="h-3 w-3 text-[#40E0D0] flex-shrink-0" fill="currentColor" />}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Trophy className="h-3 w-3 text-[#40E0D0] flex-shrink-0" />
                        <span className="font-medium">{user.currentStreak || 0} week streak</span>
                      </div>
                      <div className="mt-2">
                        <Badge className="bg-[#40E0D0] text-black whitespace-nowrap text-xs px-2 py-1">
                          {user.attendanceCount} attendances
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No leaderboard data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {attendances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No attendance records found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            attendances.reduce((acc, attendance) => {
              const date = format(new Date(attendance.date), "yyyy-MM-dd")
              if (!acc[date]) {
                acc[date] = []
              }
              acc[date].push(attendance)
              return acc
            }, {})
          ).map(([date, dateAttendances]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {format(new Date(date), "MMMM d, yyyy")}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>
              
              {dateAttendances.map((attendance, index) => {
                const isLastItem = index === dateAttendances.length - 1
                const formattedTime = format(new Date(attendance.date), "HH:mm:ss")

                return (
                  <div
                    key={attendance._id}
                    ref={isLastItem ? lastAttendanceCallback : null}
                    className="bg-card rounded-lg p-4 border"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Link href={`/profile/username/${attendance.user?.username || ""}`} className="shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={attendance.user?.profileImage} alt={attendance.user?.username} />
                          <AvatarFallback>
                            {attendance.user?.firstName?.charAt(0) || ""}
                            {attendance.user?.lastName?.charAt(0) || ""}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/username/${attendance.user?.username || ""}`}
                          className="font-medium flex items-center gap-1 hover:text-[#40E0D0] hover:underline truncate"
                        >
                          {attendance.user?.firstName} {attendance.user?.lastName}
                          {topUserIds.includes(attendance.user?._id) && (
                            <Crown className="h-3 w-3 text-[#40E0D0] flex-shrink-0" fill="currentColor" />
                          )}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">@{attendance.user?.username}</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formattedTime}</span>
                      </div>

                      {attendance.gymName && (
                        <div className="flex flex-col gap-1 text-sm">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              const locationElement = document.getElementById(`global-location-${attendance._id}`)
                              if (locationElement) {
                                locationElement.classList.toggle("hidden")
                              }
                            }}
                            className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                          >
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{attendance.gymName}</span>
                          </button>

                          <div id={`global-location-${attendance._id}`} className="hidden pl-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
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
                          </div>
                        </div>
                      )}

                      {attendance.notes && <p className="text-sm mt-2">{attendance.notes}</p>}

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

                    {attendance.image && (
                      <div className="hidden md:block rounded-md overflow-hidden w-full max-w-[200px]">
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
                )
              })}
            </div>
          ))}

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
      )}
    </div>
  )
}
