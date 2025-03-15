"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, MapPin, Calendar } from "lucide-react"

// Mock data - would come from database in real implementation
const friendsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    username: "sarahj",
    avatar: "/placeholder.svg?height=40&width=40",
    lastActive: "2 hours ago",
    streak: 5,
    recentActivity: {
      date: "Today, 7:15 AM",
      location: "Fitness Center Downtown",
      points: 2,
    },
  },
  {
    id: 2,
    name: "Mike Chen",
    username: "mikechen",
    avatar: "/placeholder.svg?height=40&width=40",
    lastActive: "Yesterday",
    streak: 12,
    recentActivity: {
      date: "Yesterday, 6:30 PM",
      location: "Gold's Gym",
      points: 2,
    },
  },
  {
    id: 3,
    name: "Emma Wilson",
    username: "emmaw",
    avatar: "/placeholder.svg?height=40&width=40",
    lastActive: "3 days ago",
    streak: 0,
    recentActivity: {
      date: "March 10, 8:00 AM",
      location: "Planet Fitness",
      points: 2,
    },
  },
]

export function FriendsTab() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Friends</h2>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {friendsData.map((friend) => (
          <Card key={friend.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{friend.name}</CardTitle>
                    <CardDescription>@{friend.username}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={friend.streak > 0 ? "default" : "outline"}>
                    {friend.streak > 0 ? `${friend.streak} day streak` : "No streak"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">Last active: {friend.lastActive}</p>
                {friend.recentActivity && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="font-medium mb-1">Recent Activity:</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{friend.recentActivity.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{friend.recentActivity.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

