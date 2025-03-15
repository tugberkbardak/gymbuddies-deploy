import { currentUser } from "@clerk/nextjs/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, Calendar, Trophy, MapPin } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  // Mock data - would come from database in real implementation
  const userStats = {
    totalAttendance: 24,
    currentStreak: 5,
    totalPoints: 42,
    rank: 3,
    joinedDate: "January 15, 2023",
  }

  const recentAttendance = [
    {
      id: 1,
      date: "Today, 9:30 AM",
      location: "Fitness Center Downtown",
      coordinates: { lat: 40.7128, lng: -74.006 },
      points: 2,
    },
    {
      id: 2,
      date: "Yesterday, 6:15 PM",
      location: "Gold's Gym",
      coordinates: { lat: 40.758, lng: -73.9855 },
      points: 1,
    },
  ]

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
                    <AvatarImage src={user.imageUrl} alt={user.username || ""} />
                    <AvatarFallback>
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription>
                      @{user.username || user.emailAddresses[0].emailAddress.split("@")[0]}
                    </CardDescription>
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
                    <div className="text-2xl font-bold">#{userStats.rank}</div>
                    <p className="text-xs text-muted-foreground">Among friends</p>
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
                {recentAttendance.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.location}</span>
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
        </div>
      </main>
    </div>
  )
}

