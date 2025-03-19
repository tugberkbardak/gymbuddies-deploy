import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar, Trophy } from "lucide-react"
import { redirect } from "next/navigation"
import AttendanceHeatmap from "@/components/profile/attendance-heatmap"
import { getUserAttendanceHeatmap } from "@/actions/attendance-actions"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"

export default async function ProfilePage() {
  // Use currentUser instead of auth for more reliable authentication
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch attendance heatmap data
  const attendanceHeatmapData = await getUserAttendanceHeatmap()

  // Get user stats from the database
  await dbConnect()
  const dbUser = await User.findOne({ clerkId: user.id })

  if (!dbUser) {
    // Create a new user if not found in the database
    const newUser = new User({
      clerkId: user.id,
      username: user.username || `user_${Date.now()}`,
      email: user.emailAddresses[0]?.emailAddress || `user_${Date.now()}@example.com`,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profileImage: user.imageUrl || "",
      joinedDate: new Date(),
      lastActive: new Date(),
    })

    await newUser.save()
    console.log("Created new user in database:", newUser._id)

    // Redirect to dashboard to ensure everything is properly loaded
    redirect("/dashboard")
  }

  // Calculate real rank among friends
  // 1. Get all friends
  const friendships = await Friendship.find({
    $or: [
      { user: dbUser._id, status: "accepted" },
      { friend: dbUser._id, status: "accepted" },
    ],
  })

  // 2. Extract friend IDs
  const friendIds = friendships.map((friendship) => {
    if (friendship.user.toString() === dbUser._id.toString()) {
      return friendship.friend
    } else {
      return friendship.user
    }
  })

  // 3. Add the user's own ID to include them in the ranking
  friendIds.push(dbUser._id)

  // 4. Get all users with their points
  const usersWithPoints = await User.find({
    _id: { $in: friendIds },
  }).sort({ totalPoints: -1 })

  // 5. Find user's position in the sorted list
  const userRank = usersWithPoints.findIndex((u) => u._id.toString() === dbUser._id.toString()) + 1

  const userStats = {
    totalAttendance: dbUser.totalAttendance || 0,
    currentStreak: dbUser.currentStreak || 0,
    totalPoints: dbUser.totalPoints || 0,
    rank: userRank,
    joinedDate: dbUser.joinedDate
      ? new Date(dbUser.joinedDate).toLocaleDateString("en-US", {
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
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={dbUser.profileImage} alt={dbUser.username} />
                    <AvatarFallback>
                      {dbUser.firstName?.charAt(0) || ""}
                      {dbUser.lastName?.charAt(0) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {dbUser.firstName} {dbUser.lastName}
                    </CardTitle>
                    <CardDescription>@{dbUser.username}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {userStats.joinedDate}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {userStats.currentStreak} day streak
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add bio section here */}
              {dbUser.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{dbUser.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">
                      {userRank === 1 ? (
                        <span className="text-amber-500">#{userStats.rank}</span>
                      ) : (
                        <span>#{userStats.rank}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Among {friendIds.length} {friendIds.length === 1 ? "person" : "people"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Attendance Heatmap Card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Gym Attendance</CardTitle>
              <CardDescription>Your gym attendance throughout the year</CardDescription>
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

