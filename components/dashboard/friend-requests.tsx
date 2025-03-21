"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function FriendRequests({ onRequestHandled }) {
  const { toast } = useToast()
  const router = useRouter()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingIds, setProcessingIds] = useState({})

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/friends/requests")

      if (!response.ok) {
        throw new Error(`Failed to fetch friend requests: ${response.statusText}`)
      }

      const data = await response.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching friend requests:", err)
      setError(err.message || "Failed to fetch friend requests")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAccept = async (requestId) => {
    setProcessingIds((prev) => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to accept friend request")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Friend request accepted",
          description: "You are now friends!",
        })

        // Remove the request from the list
        setRequests((prev) => prev.filter((req) => req._id !== requestId))

        // Notify parent component
        if (onRequestHandled) {
          onRequestHandled()
        }

        // Refresh the page to update UI
        router.refresh()
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
    } finally {
      setProcessingIds((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  const handleReject = async (requestId) => {
    setProcessingIds((prev) => ({ ...prev, [requestId]: true }))

    try {
      const response = await fetch(`/api/friends/requests/${requestId}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to reject friend request")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Friend request rejected",
        })

        // Remove the request from the list
        setRequests((prev) => prev.filter((req) => req._id !== requestId))

        // Notify parent component
        if (onRequestHandled) {
          onRequestHandled()
        }
      } else {
        throw new Error(result.message || "Failed to reject friend request")
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to reject friend request",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => ({ ...prev, [requestId]: false }))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchRequests}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return null // Don't show anything if there are no requests
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-md">
              <div className="flex items-center gap-3 flex-1">
                <Link href={`/profile/username/${request.user?.username || ""}`}>
                  <Avatar>
                    <AvatarImage src={request.user?.profileImage} alt={request.user?.username} />
                    <AvatarFallback>
                      {request.user?.firstName?.charAt(0) || ""}
                      {request.user?.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link
                    href={`/profile/username/${request.user?.username || ""}`}
                    className="font-medium hover:underline"
                  >
                    {request.user?.firstName} {request.user?.lastName}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{request.user?.username}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => handleAccept(request._id)}
                  disabled={processingIds[request._id]}
                >
                  {processingIds[request._id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  onClick={() => handleReject(request._id)}
                  disabled={processingIds[request._id]}
                >
                  {processingIds[request._id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

