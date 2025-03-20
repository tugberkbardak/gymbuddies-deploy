import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PublicHeader } from "@/components/dashboard/public-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Friendship from "@/models/Friendship"
import AttendanceHeatmap from "@/components/profile/attendance-heatmap"
import { getUserAttendanceHeatmap } from "@/actions/attendance-actions"
import { FriendshipActions } from "@/components/profile/friendship-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, UserPlus } from "lucide-react"
import {
  Card as CardUI,
  CardContent as CardContentUI,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignInButton } from "@clerk/nextjs"
import { JoinCTA } from "@/components/profile/join-cta"
import { ShareProfileButton } from "@/components/profile/share-profile-button"
import { BuddiesCard } from "@/components/profile/buddies-card"

export default async function ProfileByUsernamePage({ params }: { params: { username: string } }) {
  const user = await currentUser()
  const isSignedIn = !!user

  await dbConnect()

  // Find the user by username
  const profileUser = await User.findOne({ username: params.username })

  if (!profileUser) {
    // Render a "user not found" message
    return (
      <div className="min-h-screen flex flex-col">
        {isSignedIn ? <DashboardHeader /> : <PublicHeader />}
        <main className="flex-1 container py-6">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <h2 className="text-xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The user with username "{params.username}" doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Add this after the profileUser is fetched
  let friendCount = 0
  if (profileUser) {
    // Count the number of accepted friendships
    const friendships = await Friendship.countDocuments({
      $or: [
        { user: profileUser._id, status: "accepted" },
        { friend: profileUser._id, status: "accepted" },
      ],
    })
    friendCount = friendships
  }

  // User stats - simplified for non-signed-in users
  const userStats = {
    totalAttendance: profileUser.totalAttendance || 0,
    currentStreak: profileUser.currentStreak || 0,
    totalPoints: profileUser.totalPoints || 0,
    rank: 0,
    joinedDate: profileUser.joinedDate
      ? new Date(profileUser.joinedDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown",
  }

  // Only fetch additional data if the user is signed in
  const friendshipStatus = { status: "none", direction: "none" }
  let attendanceHeatmapData = []
  let isOwnProfile = false

  if (isSignedIn) {
    // Fetch attendance heatmap data
    attendanceHeatmapData = await getUserAttendanceHeatmap(profileUser.clerkId)

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
    userStats.rank = usersWithPoints.findIndex((u) => u._id.toString() === profileUser._id.toString()) + 1

    // Skip friendship check if viewing own profile
    if (user.id !== profileUser.clerkId) {
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
    isOwnProfile = user.id === profileUser.clerkId
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isSignedIn ? <DashboardHeader /> : <PublicHeader />}

      <main className="flex-1 container py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href={isSignedIn ? "/dashboard" : "/"}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              {isSignedIn ? "Back to Dashboard" : "Back to Home"}
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <CardUI>
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
                  {userStats.currentStreak > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {userStats.currentStreak} day streak
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContentUI>
              {profileUser.bio && isSignedIn && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{profileUser.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <CardUI>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                  </CardHeader>
                  <CardContentUI className="py-2">
                    <div className="text-2xl font-bold">{userStats.totalAttendance}</div>
                    <p className="text-xs text-muted-foreground">Gym visits</p>
                  </CardContentUI>
                </CardUI>

                {isSignedIn && (
                  <BuddiesCard userId={profileUser.clerkId} username={profileUser.username} friendCount={friendCount} />
                )}

                {isSignedIn && (
                  <>
                    <CardUI>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                      </CardHeader>
                      <CardContentUI className="py-2">
                        <div className="text-2xl font-bold">{userStats.currentStreak}</div>
                        <p className="text-xs text-muted-foreground">Days in a row</p>
                      </CardContentUI>
                    </CardUI>

                    <CardUI>
                      <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                      </CardHeader>
                      <CardContentUI className="py-2">
                        <div className="text-2xl font-bold">{userStats.totalPoints}</div>
                        <p className="text-xs text-muted-foreground">Points earned</p>
                      </CardContentUI>
                    </CardUI>
                  </>
                )}
              </div>
            </CardContentUI>
            <CardFooter>
              {isSignedIn ? (
                isOwnProfile ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                    <ShareProfileButton username={profileUser.username} />
                  </div>
                ) : (
                  <FriendshipActions
                    targetUserId={profileUser.clerkId}
                    initialStatus={friendshipStatus.status}
                    initialDirection={friendshipStatus.direction}
                  />
                )
              ) : (
                <SignInButton mode="modal">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign in to add friend
                  </Button>
                </SignInButton>
              )}
            </CardFooter>
          </CardUI>

          {/* Attendance Heatmap Card - only shown to signed-in users */}
          {isSignedIn && (
            <CardUI className="overflow-hidden">
              <CardHeader>
                <CardTitle>Gym Attendance</CardTitle>
                <CardDescription>Gym attendance throughout the year</CardDescription>
              </CardHeader>
              <CardContentUI>
                <AttendanceHeatmap attendanceData={attendanceHeatmapData} />
              </CardContentUI>
            </CardUI>
          )}

          {/* For non-signed-in users, show a call to action */}
          {!isSignedIn && <JoinCTA />}
        </div>
      </main>
    </div>
  )
}

