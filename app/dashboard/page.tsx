import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { GlobalTab } from "@/components/dashboard/global-tab"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { auth } from "@clerk/nextjs/server"
import DashboardAutoRefresh from "@/components/dashboard/dashboard-auto-refresh"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export default async function DashboardPage({ searchParams }) {
  // Get auth info
  const { userId } = auth()

  // Connect to database
  await dbConnect()

  // Check if user exists in our database
  let dbUser = null

  if (userId) {
    dbUser = await User.findOne({ clerkId: userId })

    // If user doesn't exist in our database, create them
    if (!dbUser) {
      console.log("User not found in database, creating new user")

      // Create new user with minimal required fields
      dbUser = new User({
        clerkId: userId,
        username: `user_${Date.now()}`, // Generate a temporary username
        email: `user_${Date.now()}@example.com`, // Generate a temporary email
        joinedDate: new Date(),
        lastActive: new Date(),
      })

      await dbUser.save()
      console.log("Created new user in database")
    } else {
      // Update last active
      dbUser.lastActive = new Date()
      await dbUser.save()
    }
  }

  // Get the active tab from URL parameters or default to "attendance"
  const activeTab = searchParams?.tab || "attendance"

  // Mock data - in a real app, this would come from your database
  const isPremiumUser = false // Set to true to test premium access

  return (
    <>
      <DashboardAutoRefresh />
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />

        <main className="flex-1 container py-6">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              <AttendanceTab />
            </TabsContent>

            <TabsContent value="friends" className="space-y-4">
              <FriendsTab />
            </TabsContent>

            <TabsContent value="global" className="space-y-4">
              <GlobalTab />
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <GroupsTab isPremium={true} userHasPremium={isPremiumUser} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}

