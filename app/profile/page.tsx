import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar, Trophy, MapPin } from "lucide-react"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/actions/user-actions"
import { getUserAttendance } from "@/actions/attendance-actions"
import { formatDistanceToNow, format } from "date-fns"

export default async function ProfilePage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/")
  }

  // Get user profile from MongoDB
  const user = await getUserProfile()

  // Get recent attendance
  const { attendances } = await getUserAttendance(1, 2)

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
                    <AvatarImage src={clerkUser.imageUrl} alt={clerkUser.username || ""} />
                    <AvatarFallback>
                      {clerkUser.firstName?.charAt(0)}
                      {clerkUser.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {clerkUser.firstName} {clerkUser.lastName}
                    </CardTitle>
                    <CardDescription>
                      @{clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split("@")[0]}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {format(new Date(user.joinedDate), "MMMM d, yyyy")}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {user.currentStreak} day streak
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Bio</h3>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{user.totalAttendance}</div>
                    <p className="text-xs text-muted-foreground">Gym visits</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{user.currentStreak}</div>
                    <p className="text-xs text-muted-foreground">Days in a row</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">{user.totalPoints}</div>
                    <p className="text-xs text-muted-foreground">Points earned</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-2xl font-bold">
                      {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                    </div>
                    <p className="text-xs text-muted-foreground">Last gym visit</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendances.length > 0 ? (
                  attendances.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                          </span>
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
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No recent attendance records</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

