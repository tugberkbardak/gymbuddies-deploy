"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, AlertCircle } from "lucide-react"
import { AddFriendDialog } from "@/components/dashboard/add-friend-dialog"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export function FriendsTab() {
  const { toast } = useToast()
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch friends data
      const friendsResponse = await fetch("/api/friends")
      const incomingResponse = await fetch("/api/friends/requests")
      const outgoingResponse = await fetch("/api/friends/outgoing")

      // Check for response errors
      if (!friendsResponse.ok) {
        throw new Error(`Friends API error: ${friendsResponse.status}`)
      }
      if (!incomingResponse.ok) {
        throw new Error(`Incoming requests API error: ${incomingResponse.status}`)
      }
      if (!outgoingResponse.ok) {
        throw new Error(`Outgoing requests API error: ${outgoingResponse.status}`)
      }

      // Parse JSON responses with error handling
      let friendsData, incomingData, outgoingData

      try {
        friendsData = await friendsResponse.json()
      } catch (e) {
        console.error("Error parsing friends response:", e)
        friendsData = []
      }

      try {
        incomingData = await incomingResponse.json()
      } catch (e) {
        console.error("Error parsing incoming requests response:", e)
        incomingData = []
      }

      try {
        outgoingData = await outgoingResponse.json()
      } catch (e) {
        console.error("Error parsing outgoing requests response:", e)
        outgoingData = []
      }

      setFriends(Array.isArray(friendsData) ? friendsData : [])
      setIncomingRequests(Array.isArray(incomingData) ? incomingData : [])
      setOutgoingRequests(Array.isArray(outgoingData) ? outgoingData : [])
    } catch (error) {
      console.error("Error loading friends data:", error)
      setError(error.message || "Failed to load friends data")
      toast({
        title: "Error",
        description: "Failed to load friends data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to accept friend request" }))
        throw new Error(errorData.message || "Failed to accept friend request")
      }

      const result = await response.json().catch(() => ({ success: false }))

      if (result.success) {
        toast({
          title: "Friend request accepted",
          description: "You are now friends!",
        })
        loadData() // Refresh data
      } else {
        throw new Error(result.message || "Failed to accept friend request")
      }
    } catch (error) {
      console.error("Error accepting friend request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to accept friend request",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to decline friend request" }))
        throw new Error(errorData.message || "Failed to decline friend request")
      }

      const result = await response.json().catch(() => ({ success: false }))

      if (result.success) {
        toast({
          title: "Friend request declined",
        })
        loadData() // Refresh data
      } else {
        throw new Error(result.message || "Failed to decline friend request")
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to decline friend request",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Friends</h2>
        <AddFriendDialog onFriendRequestSent={loadData} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Friend Requests Section */}
      {incomingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Friend Requests</h3>
            <Badge variant="secondary" className="rounded-full px-2">
              {incomingRequests.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {incomingRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.user?.profileImage} alt={request.user?.username} />
                        <AvatarFallback>{request.user?.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {request.user?.firstName || ""} {request.user?.lastName || ""}
                          {!request.user?.firstName && !request.user?.lastName && "User"}
                        </CardTitle>
                        <CardDescription>@{request.user?.username || "user"}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request._id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request._id)}>
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Friend Requests Section */}
      {outgoingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sent Requests</h3>
          <div className="space-y-3">
            {outgoingRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.friend?.profileImage} alt={request.friend?.username} />
                        <AvatarFallback>{request.friend?.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {request.friend?.firstName || ""} {request.friend?.lastName || ""}
                          {!request.friend?.firstName && !request.friend?.lastName && "User"}
                        </CardTitle>
                        <CardDescription>@{request.friend?.username || "user"}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Friends</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted"></div>
                      <div>
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-3 w-16 bg-muted rounded mt-2"></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-20 w-full bg-muted rounded mt-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : friends.length > 0 ? (
          <div className="space-y-3">
            {friends.map((friendship) => {
              console.log("Friend data:", friendship.friend)
              return (
                <Card key={friendship.friendship?._id || Math.random()}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friendship.friend?.profileImage} alt={friendship.friend?.username} />
                          <AvatarFallback>{friendship.friend?.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={friendship.friend?.clerkId ? `/profile/${friendship.friend.clerkId}` : "#"}
                            className="hover:underline"
                            onClick={(e) => {
                              if (!friendship.friend?.clerkId) {
                                e.preventDefault()
                                console.error("Missing clerkId for friend:", friendship.friend)
                                toast({
                                  title: "Error",
                                  description: "Cannot view profile: User ID is missing",
                                  variant: "destructive",
                                })
                              }
                            }}
                          >
                            <CardTitle className="text-base">
                              {friendship.friend?.firstName || ""} {friendship.friend?.lastName || ""}
                              {!friendship.friend?.firstName && !friendship.friend?.lastName && "User"}
                            </CardTitle>
                          </Link>
                          <CardDescription>@{friendship.friend?.username || "user"}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={friendship.friend?.currentStreak > 0 ? "default" : "outline"}>
                        {friendship.friend?.currentStreak > 0
                          ? `${friendship.friend.currentStreak} day streak`
                          : "No streak"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-2">
                        Last active:{" "}
                        {friendship.friend?.lastActive
                          ? new Date(friendship.friend.lastActive).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground mb-4">You don't have any friends yet.</p>
              <AddFriendDialog onFriendRequestSent={loadData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

