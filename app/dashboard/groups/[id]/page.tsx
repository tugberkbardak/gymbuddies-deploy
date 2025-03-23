import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Trophy, Users, Calendar, BarChart } from "lucide-react"

// Mock data - would come from database in real implementation
const groupData = {
  id: 1,
  name: "Morning Workout Crew",
  description: "Early birds who hit the gym before work",
  members: 8,
  totalPoints: 245,
  userPoints: 42,
  userRank: 3,
  createdAt: "January 15, 2023",
  stats: {
    weeklyAttendance: 24,
    monthlyAttendance: 86,
    averagePointsPerMember: 30.6,
  },
  members: [
    {
      id: 1,
      name: "Alex Smith",
      username: "alexs",
      points: 68,
      streak: 7,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Jessica Lee",
      username: "jesslee",
      points: 56,
      streak: 4,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "John Doe",
      username: "johndoe",
      points: 42,
      streak: 3,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Emily Chen",
      username: "emilyc",
      points: 38,
      streak: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Michael Johnson",
      username: "mikej",
      points: 35,
      streak: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 6,
      name: "Sarah Wilson",
      username: "sarahw",
      points: 32,
      streak: 1,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 7,
      name: "David Brown",
      username: "davidb",
      points: 28,
      streak: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 8,
      name: "Lisa Garcia",
      username: "lisag",
      points: 24,
      streak: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
  recentActivity: [
    {
      id: 1,
      member: "Alex Smith",
      action: "Recorded gym attendance",
      location: "Fitness Center Downtown",
      points: 2,
      time: "2 hours ago",
    },
    {
      id: 2,
      member: "Jessica Lee",
      action: "Recorded gym attendance",
      location: "Gold's Gym",
      points: 2,
      time: "Yesterday",
    },
    {
      id: 3,
      member: "John Doe",
      action: "Recorded gym attendance",
      location: "Planet Fitness",
      points: 3,
      time: "2 days ago",
    },
  ],
}

export default function GroupDetailsPage({ params }: { params: { id: string } }) {
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
                <div>
                  <CardTitle className="text-2xl">{groupData.name}</CardTitle>
                  <CardDescription>{groupData.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {groupData.members.length} members
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {groupData.createdAt}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {groupData.userPoints} / {groupData.totalPoints} points
                    </span>
                  </div>
                  <Progress value={(groupData.userPoints / groupData.totalPoints) * 100} />
                  <p className="text-xs text-muted-foreground mt-2">
                    You're ranked #{groupData.userRank} in this group
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium">Weekly Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-2xl font-bold">{groupData.stats.weeklyAttendance}</div>
                      <p className="text-xs text-muted-foreground">Total gym visits this week</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium">Monthly Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-2xl font-bold">{groupData.stats.monthlyAttendance}</div>
                      <p className="text-xs text-muted-foreground">Total gym visits this month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-medium">Avg. Points Per Member</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-2xl font-bold">{groupData.stats.averagePointsPerMember}</div>
                      <p className="text-xs text-muted-foreground">Average points earned</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="members">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Members
                </h3>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-amber-500" />
                  Ranked by Points
                </Badge>
              </div>

              <div className="space-y-4">
                {groupData.members.map((member, index) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium">
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">@{member.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {member.streak > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {member.streak} {member.streak === 1 ? "week" : "weeks"} streak
                            </Badge>
                          )}
                          <Badge>{member.points} points</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Recent Activity
                </h3>
              </div>

              <div className="space-y-4">
                {groupData.recentActivity.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.member}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.action} at {activity.location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                        <Badge variant="secondary">{activity.points} Points</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

