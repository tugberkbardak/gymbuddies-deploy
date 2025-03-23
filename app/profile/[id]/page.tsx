import { auth, currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import mongoose from "mongoose"
import AttendanceHeatmap from "@/components/profile/attendance-heatmap"
import { getUserAttendanceHeatmap } from "@/actions/attendance-actions"
import { FriendshipActions } from "@/components/profile/friendship-actions"
import { BuddiesCard } from "@/components/profile/buddies-card"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }

  await dbConnect()

  // Find the user by clerkId
  const profileUser = await User.findOne({ clerkId: params.id })

  if (!profileUser) {
    console.error(`User not found with clerkId: ${params.id}`)

    // Check if the ID might be a MongoDB ObjectId instead of a clerkId
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      const userByObjectId = await User.findById(params.id)
      if (userByObjectId) {
        return redirect(`/profile/${userByObjectId.clerkId}`)
      }
    }

    // Instead of redirecting, render a "user not found" message
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <main className="flex-1 container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard?tab=friends">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <h2 className="text-xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The user profile you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Fetch attendance heatmap data
  const attendanceHeatmapData = await getUserAttendanceHeatmap(params.id)

  // Calculate real rank among friends
  // 1. Get all friends
  const friendships = await Friendship.find({
    $or: [
      { user: profileUser._id, status: "accepted" },
      { friend: profileUser._id, status: "accepted" },
    ],
  })

  // 2. Extract friend IDs
  const friendIds = friendships.map((friendship) => {
    if (friendship.user.toString() === profileUser._id.toString()) {
      return friendship.friend
    } else {
      return friendship.user
    }
  })

  // 3. Add the user's own ID to include them in the ranking
  friendIds.push(profileUser._id)

  // 4. Get all users with their points
  const usersWithPoints = await User.find({
    _id: { $in: friendIds },
  }).sort({ totalPoints: -1 })

  // 5. Find user's position in the sorted list
  const userRank = usersWithPoints.findIndex((u) => u._id.toString() === profileUser._id.toString()) + 1

  // User stats
  const userStats = {
    totalAttendance: profileUser.totalAttendance || 0,
    currentStreak: profileUser.currentStreak || 0,
    totalPoints: profileUser.totalPoints || 0,
    rank: userRank,
    joinedDate: profileUser.joinedDate
      ? new Date(profileUser.joinedDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      : "Unknown",
  }

  // Check friendship status
  const friendshipStatus = { status: "none", direction: "none" }

  // Skip friendship check if viewing own profile
  if (user.id !== params.id) {
    // Find the current user in MongoDB
    const currentUserDoc = await User.findOne({ clerkId: user.id })

    if (currentUserDoc) {
      // Check if a friendship exists
      const friendship = await Friendship.findOne({
        $or: [
          { user: currentUserDoc._id, friend: profileUser._id },
          { user: profileUser._id, friend: currentUserDoc._id },
        ],
      })

      if (friendship) {
        friendshipStatus.status = friendship.status

        if (friendship.status === "pending") {
          if (friendship.user.toString() === currentUserDoc._id.toString()) {
            friendshipStatus.direction = "outgoing"
          } else {
            friendshipStatus.direction = "incoming"
          }
        }
      }
    }
  }

  // Determine if this is the current user's profile
  const isOwnProfile = user.id === params.id

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
                    <AvatarImage src={profileUser.profileImage} alt={profileUser.username} />
                    <AvatarFallback>
                      {profileUser.firstName?.charAt(0)}
                      {profileUser.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {profileUser.firstName} {profileUser.lastName}
                    </CardTitle>
                    <CardDescription>@{profileUser.username}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {userStats.joinedDate}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profileUser.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{profileUser.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{userStats.totalAttendance}</div>
                    <p className="text-xs text-muted-foreground">Total days at gym</p>
                  </CardContent>
                </Card>

                <BuddiesCard
                  userId={params.id}
                  username={profileUser.username}
                  friendCount={friendIds.length - 1} // Subtract 1 because friendIds includes the user
                />

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
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{userStats.currentStreak}</div>
                    <p className="text-xs text-muted-foreground">{userStats.currentStreak === 1 ? "Day" : "Days"}</p>
                    <p className="text-xs text-muted-foreground mt-1">(3+ gym visits per week required)</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              {isOwnProfile ? (
                <Button variant="outline" asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
              ) : (
                <FriendshipActions
                  targetUserId={params.id}
                  initialStatus={friendshipStatus.status}
                  initialDirection={friendshipStatus.direction}
                />
              )}
            </CardFooter>
          </Card>

          {/* Attendance Heatmap Card */}
          <Card className="overflow-hidden">
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

