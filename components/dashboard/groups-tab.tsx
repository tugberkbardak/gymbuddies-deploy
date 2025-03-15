"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Trophy, Users } from "lucide-react"
import Link from "next/link"

// Mock data - would come from database in real implementation
const groupsData = [
  {
    id: 1,
    name: "Morning Workout Crew",
    description: "Early birds who hit the gym before work",
    members: 8,
    totalPoints: 245,
    userPoints: 42,
    userRank: 3,
    leaderboard: [
      { name: "Alex Smith", points: 68, avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Jessica Lee", points: 56, avatar: "/placeholder.svg?height=32&width=32" },
      { name: "John Doe", points: 42, avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
  {
    id: 2,
    name: "Weekend Warriors",
    description: "We make the most of our weekends with intense workouts",
    members: 12,
    totalPoints: 320,
    userPoints: 28,
    userRank: 5,
    leaderboard: [
      { name: "Mike Johnson", points: 72, avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Sarah Wilson", points: 65, avatar: "/placeholder.svg?height=32&width=32" },
      { name: "David Chen", points: 58, avatar: "/placeholder.svg?height=32&width=32" },
    ],
  },
]

export function GroupsTab() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>Create a new group to compete with friends and stay motivated.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="group-name" className="text-sm font-medium">
                    Group Name
                  </label>
                  <Input id="group-name" placeholder="Enter group name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="group-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea id="group-description" placeholder="Describe your group..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {groupsData.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {group.members} members
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {group.userPoints} / {group.totalPoints} points
                  </span>
                </div>
                <Progress value={(group.userPoints / group.totalPoints) * 100} />
                <p className="text-xs text-muted-foreground mt-2">You're ranked #{group.userRank} in this group</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Leaderboard
                </h4>
                <div className="space-y-2">
                  {group.leaderboard.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-6">{index + 1}.</span>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                      </div>
                      <Badge variant="outline">{member.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/groups/${group.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View Group Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

