import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar, Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import mongoose from "mongoose"
import AttendanceHeatmap from "@/components/profile/attendance-heatmap"
import { getUserAttendanceHeatmap } from "@/actions/attendance-actions"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const viewer = await currentUser()

  if (!viewer) {
    redirect("/")
  }

  await dbConnect()

  // Find the user by clerkId
  const user = await User.findOne({ clerkId: params.id })

  if (!user) {
    console.error(`User not found with clerkId: ${params.id}`)

    // Check if the ID might be a MongoDB ObjectId instead of a clerkId
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      const userByObjectId = await User.findById(params.id)
      if (userByObjectId) {
        return redirect(`/profile/${userByObjectId.clerkId}`)
      }
    }

    // If user not found, redirect to dashboard with error message
    return redirect("/dashboard?error=user-not-found")
  }

  // Fetch attendance heatmap data
  const attendanceHeatmapData = await getUserAttendanceHeatmap(params.id)

  // Calculate real rank among friends
  // 1. Get all friends
  const friendships = await Friendship.find({
    $or: [
      { user: user._id, status: "accepted" },
      { friend: user._id, status: "accepted" },
    ],
  })

  // 2. Extract friend IDs
  const friendIds = friendships.map((friendship) => {
    if (friendship.user.toString() === user._id.toString()) {
      return friendship.friend
    } else {
      return friendship.user
    }
  })

  // 3. Add the user's own ID to include them in the ranking
  friendIds.push(user._id)

  // 4. Get all users with their points
  const usersWithPoints = await User.find({
    _id: { $in: friendIds },
  }).sort({ totalPoints: -1 })

  // 5. Find user's position in the sorted list
  const userRank = usersWithPoints.findIndex((u) => u._id.toString() === user._id.toString()) + 1

  // User stats
  const userStats = {
    totalAttendance: user.totalAttendance || 0,
    currentStreak: user.currentStreak || 0,
    totalPoints: user.totalPoints || 0,
    rank: userRank,
    joinedDate: user.joinedDate
      ? new Date(user.joinedDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      : "Unknown",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard?tab=friends">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Friends
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback>
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {userStats.joinedDate}
                  </Badge>
                  {userStats.currentStreak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {userStats.currentStreak} day streak
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{userStats.totalAttendance}</div>
                    <p className="text-xs text-muted-foreground">Gym visits</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{userStats.currentStreak}</div>
                    <p className="text-xs text-muted-foreground">Days in a row</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{userStats.totalPoints}</div>
                    <p className="text-xs text-muted-foreground">Points earned</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Heatmap Card */}
          <Card>
            <CardHeader>
              <CardTitle>Gym Attendance</CardTitle>
              <CardDescription>Gym attendance throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceHeatmap attendanceData={attendanceHeatmapData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

