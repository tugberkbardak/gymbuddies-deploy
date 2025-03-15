import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  // Use currentUser instead of auth
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <main className="flex-1 container py-6">
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            <FriendsTab />
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <GroupsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

