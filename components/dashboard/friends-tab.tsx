"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { Loader2, MapPin, Calendar, Building2, UserPlus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddFriendDialog } from "@/components/dashboard/add-friend-dialog"
import { YourBuddies } from "@/components/dashboard/your-buddies"
import { FriendRequests } from "@/components/dashboard/friend-requests"
import Image from "next/image"

export function FriendsTab() {
  const [attendances, setAttendances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const observer = useRef(null)
  const lastAttendanceRef = useRef(null)

  const fetchAttendances = async (pageNum = 1, append = false) => {
    try {
      const loadingState = append ? setIsLoadingMore : setIsLoading
      loadingState(true)
      setError(null)

      const response = await fetch(`/api/attendance/friends?page=${pageNum}&limit=2`)

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

  const getMapLink = (coordinates) => {
    if (coordinates) {
      return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    }
    return "#"
  }

  const handleFriendRequestHandled = () => {
    // Refresh the attendances when a friend request is handled
    fetchAttendances()
  }

  return (
    <div className="space-y-6">
      {/* Your Buddies Section */}
      <YourBuddies />

      {/* Friend Requests Section */}
      <FriendRequests onRequestHandled={handleFriendRequestHandled} />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Friends Activity</h2>
        <Button size="sm" onClick={() => setIsAddFriendOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchAttendances()}>Try Again</Button>
        </div>
      ) : attendances.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No activity from friends yet.</p>
          <Button onClick={() => setIsAddFriendOpen(true)}>Add Friends</Button>
        </div>
      ) : (
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
                  <div className="flex-1">
                    <Link
                      href={`/profile/username/${attendance.user?.username || ""}`}
                      className="font-medium hover:underline"
                    >
                      {attendance.user?.firstName} {attendance.user?.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground">@{attendance.user?.username}</p>
                  </div>
                  <Badge variant="outline" className="md:hidden">
                    {attendance.points || 1} Point
                  </Badge>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formattedDate}</span>
                    </div>

                    {attendance.gymName && (
                      <div className="flex flex-col gap-1 text-sm">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            const locationElement = document.getElementById(`friend-location-${attendance._id}`)
                            if (locationElement) {
                              locationElement.classList.toggle("hidden")
                            }
                          }}
                          className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                        >
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{attendance.gymName}</span>
                        </button>

                        {attendance.location && (
                          <div id={`friend-location-${attendance._id}`} className="hidden pl-6">
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
                        )}
                      </div>
                    )}

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

                  {/* Desktop view for image and badge */}
                  <div className="hidden md:flex md:flex-col md:items-end md:gap-4 md:ml-4 md:min-w-[200px]">
                    <Badge variant="outline">{attendance.points || 1} Point</Badge>

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
      )}

      <AddFriendDialog
        open={isAddFriendOpen}
        onOpenChange={setIsAddFriendOpen}
        onFriendRequestSent={() => fetchAttendances()}
      />
    </div>
  )
}

