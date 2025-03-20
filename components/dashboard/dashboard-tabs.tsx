"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { GlobalTab } from "@/components/dashboard/global-tab"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface DashboardTabsProps {
  defaultTab: string
  pendingFriendRequestsCount: number
  isPremiumUser: boolean
}

export function DashboardTabs({ defaultTab, pendingFriendRequestsCount, isPremiumUser }: DashboardTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="friends" className="relative">
          Friends
          {pendingFriendRequestsCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full text-xs px-1 bg-red-600 hover:bg-red-700"
            >
              {pendingFriendRequestsCount}
            </Badge>
          )}
        </TabsTrigger>
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
  )
}

