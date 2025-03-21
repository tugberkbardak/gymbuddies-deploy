"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function YourBuddies() {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchFriends = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/users/friends")

      if (!response.ok) {
        throw new Error(`Failed to fetch friends: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setFriends(data.data)
      } else {
        throw new Error(data.error || "Failed to fetch friends")
      }
    } catch (err) {
      console.error("Error fetching friends:", err)
      setError(err.message || "Failed to fetch friends")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-4">Your Buddies</h2>
        <div className="flex justify-center items-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg p-6 border">
        <h2 className="text-2xl font-bold mb-4">Your Buddies</h2>
        <div className="text-center py-4">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchFriends}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="bg-card rounded-lg p-6 border cursor-pointer hover:bg-accent/10 transition-colors"
        onClick={() => setIsDialogOpen(true)}
      >
        <h2 className="text-2xl font-bold mb-4">Your Buddies</h2>
        {friends.length === 0 ? (
          <p className="text-muted-foreground">You don't have any buddies yet. Add friends to see them here!</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Show only 3 friends */}
            {friends.slice(0, 3).map((friendship) => (
              <Avatar key={friendship.friend?._id} className="h-12 w-12 border-2 border-background">
                <AvatarImage src={friendship.friend?.profileImage} alt={friendship.friend?.username} />
                <AvatarFallback>
                  {friendship.friend?.firstName?.charAt(0) || ""}
                  {friendship.friend?.lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
            ))}
            {friends.length > 3 && (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                +{friends.length - 3}
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-muted-foreground">Click to see all your buddies and their activity</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Buddies</DialogTitle>
            <DialogDescription>Your friends and their last activity</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {friends.map((friendship) => (
              <div
                key={friendship.friend?._id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friendship.friend?.profileImage} alt={friendship.friend?.username} />
                    <AvatarFallback>
                      {friendship.friend?.firstName?.charAt(0) || ""}
                      {friendship.friend?.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/username/${friendship.friend?.username}`}
                      className="font-medium hover:underline"
                    >
                      {friendship.friend?.firstName} {friendship.friend?.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground">@{friendship.friend?.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {friendship.friend?.lastActive ? (
                    <span>{formatDistanceToNow(new Date(friendship.friend.lastActive), { addSuffix: true })}</span>
                  ) : (
                    <span>Never active</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

