"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Check, Clock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FriendshipActionsProps {
  targetUserId: string
  initialStatus: string
  initialDirection: string
}

export function FriendshipActions({ targetUserId, initialStatus, initialDirection }: FriendshipActionsProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState(initialStatus)
  const [direction, setDirection] = useState(initialDirection)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendFriendRequest = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendClerkId: targetUserId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send friend request")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Friend request sent",
          description: "They'll be notified of your request.",
        })

        // Update friendship status
        setStatus("pending")
        setDirection("outgoing")
      } else {
        throw new Error(result.message || "Failed to send friend request")
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAcceptRequest = async () => {
    setIsProcessing(true)
    try {
      // First, we need to get the friendship ID
      const statusResponse = await fetch(`/api/friends/status/${targetUserId}`)
      if (!statusResponse.ok) {
        throw new Error("Failed to get friendship status")
      }

      const statusData = await statusResponse.json()
      if (!statusData.success || !statusData.friendshipId) {
        throw new Error("Failed to get friendship ID")
      }

      // Now accept the request
      const response = await fetch(`/api/friends/requests/${statusData.friendshipId}/accept`, {
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

        // Update friendship status
        setStatus("accepted")
        setDirection("none")
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
      setIsProcessing(false)
    }
  }

  const handleDeclineRequest = async () => {
    setIsProcessing(true)
    try {
      // First, we need to get the friendship ID
      const statusResponse = await fetch(`/api/friends/status/${targetUserId}`)
      if (!statusResponse.ok) {
        throw new Error("Failed to get friendship status")
      }

      const statusData = await statusResponse.json()
      if (!statusData.success || !statusData.friendshipId) {
        throw new Error("Failed to get friendship ID")
      }

      // Now decline the request
      const response = await fetch(`/api/friends/requests/${statusData.friendshipId}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to decline friend request")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Friend request declined",
        })

        // Update friendship status
        setStatus("none")
        setDirection("none")
      } else {
        throw new Error(result.message || "Failed to decline friend request")
      }
    } catch (error) {
      console.error("Error declining friend request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to decline friend request",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === "accepted") {
    return (
      <Badge variant="secondary" className="px-4 py-2 text-sm">
        <Check className="h-4 w-4 mr-2" />
        You are Buddies!
      </Badge>
    )
  }

  if (status === "pending" && direction === "outgoing") {
    return (
      <Badge variant="outline" className="px-4 py-2 text-sm">
        <Clock className="h-4 w-4 mr-2" />
        Friend Request Sent
      </Badge>
    )
  }

  if (status === "pending" && direction === "incoming") {
    return (
      <div className="flex gap-2">
        <Button variant="default" size="sm" onClick={handleAcceptRequest} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
          Accept Request
        </Button>
        <Button variant="outline" size="sm" onClick={handleDeclineRequest} disabled={isProcessing}>
          Decline
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleSendFriendRequest} disabled={isProcessing}>
      {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
      Add Friend
    </Button>
  )
}

