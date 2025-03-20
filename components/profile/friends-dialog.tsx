"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export function FriendsDialog({ open, onOpenChange, userId, username }) {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      loadFriends()
    }
  }, [open, userId])

  const loadFriends = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch friends for the specified user
      const response = await fetch(`/api/users/${userId}/friends`)

      if (!response.ok) {
        throw new Error(`Failed to load friends: ${response.statusText}`)
      }

      const data = await response.json()
      setFriends(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error loading friends:", err)
      setError(err.message || "Failed to load friends")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{username}'s Buddies</DialogTitle>
          <DialogDescription>Friends that {username} is connected with on GymBuddies</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : friends.length > 0 ? (
          <div className="space-y-3">
            {friends.map((friendship) => (
              <Card key={friendship.friendship?._id || Math.random()} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friendship.friend?.profileImage} alt={friendship.friend?.username} />
                      <AvatarFallback>{friendship.friend?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      {friendship.friend?.username ? (
                        <Link
                          href={`/profile/username/${friendship.friend.username}`}
                          className="hover:underline font-medium"
                        >
                          {friendship.friend?.firstName || ""} {friendship.friend?.lastName || ""}
                          {!friendship.friend?.firstName && !friendship.friend?.lastName && friendship.friend?.username}
                        </Link>
                      ) : (
                        <p className="font-medium">
                          {friendship.friend?.firstName || ""} {friendship.friend?.lastName || ""}
                          {!friendship.friend?.firstName && !friendship.friend?.lastName && "User"}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">@{friendship.friend?.username || "user"}</p>
                    </div>
                  </div>
                  <Badge variant={friendship.friend?.currentStreak > 0 ? "default" : "outline"}>
                    {friendship.friend?.currentStreak > 0
                      ? `${friendship.friend.currentStreak} day streak`
                      : "No streak"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No buddies found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

