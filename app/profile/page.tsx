import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import AttendanceHeatmap from "@/components/profile/attendance-heatmap"
import { getUserAttendanceHeatmap } from "@/actions/attendance-actions"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import WeightEntry from "@/models/WeightEntry"
import { ShareProfileButton } from "@/components/profile/share-profile-button"
import { BuddiesCard } from "@/components/profile/buddies-card"
import { ProfileInfoDisplay } from "@/components/profile/profile-info-display"
import WeightGraph from "@/components/profile/weight-graph"
import AddWeightForm from "@/components/profile/add-weight-form"

export default async function ProfilePage() {
  // Use Clerk to get the currently signed-in user
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  // Fetch attendance heatmap data
  const attendanceHeatmapData = await getUserAttendanceHeatmap()

  // Connect to MongoDB and fetch or create the user record
  await dbConnect()
  let dbUser = await User.findOne({ clerkId: user.id })
  if (!dbUser) {
    const newUser = new User({
      clerkId:         user.id,
      username:        user.username || `user_${Date.now()}`,
      email:           user.emailAddresses[0]?.emailAddress || `user_${Date.now()}@example.com`,
      firstName:       user.firstName || "",
      lastName:        user.lastName || "",
      profileImageUrl: user.imageUrl || "",
      // other fields use schema defaults via timestamps, etc.
    })
    await newUser.save()
    console.log("Created new user in database:", newUser._id)
    redirect("/dashboard")
  }

  // Get latest weight entries
  const weightEntries = await WeightEntry.find({ user: dbUser._id })
    .sort({ date: -1 })
    .limit(10)
  const weightEntriesPlain = weightEntries.map((entry) => ({
    _id:   entry._id.toString(),
    weight: entry.weight,
    date:  entry.date.toISOString(),
    notes: entry.notes,
  }))

  // User preferences
  const weightPreferences = dbUser.weightPreferences || { unit: "kg" }
  const defaultGym = dbUser.fitnessProfile?.preferences ||
    (user.unsafeMetadata as any)?.defaultGym || null

  // Compute friend-based ranking
  const friendships = await Friendship.find({
    $or: [
      { user: dbUser._id, status: "accepted" },
      { friend: dbUser._id, status: "accepted" },
    ],
  })
  const friendIds = friendships.map((f) =>
    f.user.equals(dbUser._id) ? f.friend : f.user
  )
  friendIds.push(dbUser._id)
  const usersWithPoints = await User.find({ _id: { $in: friendIds } })
    .sort({ totalPoints: -1 })
  const userRank =
    usersWithPoints.findIndex((u) => u._id.equals(dbUser._id)) + 1

  // Prepare stats
  const userStats = {
    totalAttendance: dbUser.totalAttendance || 0,
    currentStreak:   dbUser.currentStreak || 0,
    totalPoints:     dbUser.totalPoints || 0,
    rank:            userRank,
    joinedDate:      dbUser.createdAt
      ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
          year:  "numeric",
          month: "long",
          day:   "numeric",
        })
      : "Unknown",
  }

  // Final avatar URL: DB first, then Clerk
  const avatarUrl = dbUser.profileImageUrl || user.imageUrl || ""

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
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={dbUser.username} />
                    ) : (
                      <AvatarFallback>
                        {dbUser.firstName?.[0] || ""}
                        {dbUser.lastName?.[0]  || ""}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {dbUser.firstName} {dbUser.lastName}
                    </CardTitle>
                    <CardDescription>@{dbUser.username}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {userStats.joinedDate}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <ProfileInfoDisplay
                bio={dbUser.fitnessProfile?.goals ||
                  (user.unsafeMetadata as any)?.bio || null}
                defaultGym={defaultGym}
                userId={user.id}
                isOwnProfile
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                {/* Total Attendance */}
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">
                      Total Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">
                      {userStats.totalAttendance}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total days at gym
                    </p>
                  </CardContent>
                </Card>

                {/* Buddies Card */}
                <BuddiesCard
                  userId={user.id}
                  username={dbUser.username}
                  friendCount={friendIds.length - 1}
                />

                {/* Current Streak */}
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">
                      Current Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">
                      {userStats.currentStreak}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userStats.currentStreak === 1 ? "Week" : "Weeks"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (3+ gym visits per week required)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>

            <CardFooter>
              <ShareProfileButton username={dbUser.username} />
            </CardFooter>
          </Card>

          {/* Attendance Heatmap */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Gym Attendance</CardTitle>
              <CardDescription>
                Your gym attendance throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceHeatmap attendanceData={attendanceHeatmapData} />
            </CardContent>
          </Card>

          {/* Weight Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Weight Tracking</CardTitle>
              <CardDescription>
                Monitor and update your weight progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Weight History</h3>
                  {weightEntriesPlain.length > 0 ? (
                    <WeightGraph
                      entries={weightEntriesPlain}
                      unit={weightPreferences.unit}
                      goalWeight={weightPreferences.goalWeight}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[200px] bg-muted/30 rounded-md">
                      <p className="text-muted-foreground">
                        No weight entries yet. Add your first entry!
                      </p>
                    </div>
                  )}

                  {weightEntriesPlain.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Current Weight
                        </p>
                        <p className="text-xl font-bold">
                          {weightEntriesPlain[0].weight} {weightPreferences.unit}
                        </p>
                      </div>

                      {weightEntriesPlain.length > 1 && (
                        <div className="bg-muted/30 p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Change
                          </p>
                          <p
                            className={`text-xl font-bold ${
                              weightEntriesPlain[0].weight >
                                weightEntriesPlain[1].weight
                                ? "text-red-500"
                                : weightEntriesPlain[0].weight <
                                  weightEntriesPlain[1].weight
                                ? "text-green-500"
                                : ""
                            }`}
                          >
                            {(weightEntriesPlain[0].weight -
                              weightEntriesPlain[1].weight)
                              .toFixed(1)}{' '}{weightPreferences.unit}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Add Weight Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Add New Entry</h3>
                  <AddWeightForm unit={weightPreferences.unit} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
