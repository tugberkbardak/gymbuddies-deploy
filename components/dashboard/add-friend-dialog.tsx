"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, Check, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AddFriendDialog({ onFriendRequestSent }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [pendingRequests, setPendingRequests] = useState({})
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/friends/search?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`)
      }

      let results
      try {
        results = await response.json()
      } catch (e) {
        console.error("Error parsing search results:", e)
        throw new Error("Failed to parse search results")
      }

      setSearchResults(Array.isArray(results) ? results : [])
    } catch (error) {
      console.error("Error searching users:", error)
      setError(error.message || "Failed to search users. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSendRequest = async (friendClerkId) => {
    setError(null)
    setPendingRequests((prev) => ({ ...prev, [friendClerkId]: true }))

    try {
      console.log("Sending friend request to:", friendClerkId)

      const requestBody = JSON.stringify({ friendClerkId })
      console.log("Request body:", requestBody)

      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      })

      console.log("Response status:", response.status)

      // Get the raw text first to debug
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      // Try to parse as JSON
      let result
      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        const errorMessage = result?.message || `Request failed with status: ${response.status}`
        console.error("Error details:", result)
        throw new Error(errorMessage)
      }

      if (result.success) {
        // Update the search results to reflect the pending request
        setSearchResults((prev) =>
          prev.map((user) => (user.clerkId === friendClerkId ? { ...user, friendshipStatus: "pending" } : user)),
        )

        toast({
          title: "Friend request sent",
          description: "They'll be notified of your request.",
        })

        // Call the callback to refresh the parent component
        if (onFriendRequestSent) {
          onFriendRequestSent()
        }
      } else {
        throw new Error(result.message || "Failed to send friend request")
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
      setError(error.message || "Failed to send friend request")

      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      })
    } finally {
      setPendingRequests((prev) => ({ ...prev, [friendClerkId]: false }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>Search for users by name or username to send friend requests.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2 my-4">
          <div className="grid flex-1 gap-2">
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button type="button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user.clerkId || Math.random()}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.firstName || ""} {user.lastName || ""}
                        {!user.firstName && !user.lastName && "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">@{user.username || "user"}</p>
                    </div>
                  </div>

                  {user.friendshipStatus === "accepted" ? (
                    <Badge variant="outline" className="bg-green-50">
                      <Check className="h-3 w-3 mr-1" />
                      Friends
                    </Badge>
                  ) : user.friendshipStatus === "pending" ? (
                    <Badge variant="outline" className="bg-amber-50">
                      Request Sent
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user.clerkId)}
                      disabled={pendingRequests[user.clerkId]}
                    >
                      {pendingRequests[user.clerkId] ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <UserPlus className="h-3 w-3 mr-1" />
                      )}
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Searching...</p>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found. Try a different search term.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Search for users to add as friends.</p>
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

