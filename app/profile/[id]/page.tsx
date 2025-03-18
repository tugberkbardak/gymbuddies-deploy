import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar, Trophy, MapPin } from "lucide-react"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Attendance from "@/models/Attendance"
import { serializeMongooseObject } from "@/lib/utils-server"
import mongoose from "mongoose"

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

  // Get recent attendance for this user
  const recentAttendance = await Attendance.find({ user: user._id }).sort({ date: -1 }).limit(3)

  const serializedAttendance = serializeMongooseObject(recentAttendance)

  // User stats
  const userStats = {
    totalAttendance: user.totalAttendance || 0,
    currentStreak: user.currentStreak || 0,
    totalPoints: user.totalPoints || 0,
    joinedDate: user.joinedDate
      ? new Date(user.joinedDate).toLocaleDateString("en-US", {
          year: "numeric",
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

          {serializedAttendance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serializedAttendance.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{new Date(item.date).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.gymName}</span>
                          <a
                            href={`https://www.google.com/maps?q=${item.coordinates.lat},${item.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline"
                          >
                            View on map
                          </a>
                        </div>
                      </div>
                      <Badge>{item.points} Points</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

