"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface FriendsListDialogProps {
  userId: string
  username: string
  trigger: React.ReactNode
}

export function FriendsListDialog({ userId, username, trigger }: FriendsListDialogProps) {
  const [open, setOpen] = useState(false)
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
      const response = await fetch(`/api/users/${userId}/friends`)

      if (!response.ok) {
        throw new Error(`Failed to load friends: ${response.status}`)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{username}'s Buddies</DialogTitle>
          <DialogDescription>Friends that {username} is connected with</DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : friends.length > 0 ? (
            <div className="space-y-3">
              {friends.map((friendship) => (
                <Card key={friendship.friendship?._id || Math.random()}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friendship.friend?.profileImage} alt={friendship.friend?.username} />
                          <AvatarFallback>{friendship.friend?.username?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          {friendship.friend?.username ? (
                            <Link href={`/profile/username/${friendship.friend.username}`} className="hover:underline">
                              <CardTitle className="text-base">
                                {friendship.friend?.firstName || ""} {friendship.friend?.lastName || ""}
                                {!friendship.friend?.firstName &&
                                  !friendship.friend?.lastName &&
                                  friendship.friend?.username}
                              </CardTitle>
                            </Link>
                          ) : (
                            <CardTitle className="text-base">
                              {friendship.friend?.firstName || ""} {friendship.friend?.lastName || ""}
                              {!friendship.friend?.firstName && !friendship.friend?.lastName && "User"}
                            </CardTitle>
                          )}
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
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{username} doesn't have any buddies yet.</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

