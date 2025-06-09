"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { GlobalTab } from "@/components/dashboard/global-tab"
import { FindBuddyTab } from "@/components/dashboard/find-buddy-tab"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { 
  AttendanceTabLoading, 
  FriendsTabLoading, 
  FindBuddyTabLoading, 
  GlobalTabLoading, 
  GroupsTabLoading 
} from "@/components/ui/loading-skeleton"

interface DashboardTabsProps {
  defaultTab: string
  pendingFriendRequestsCount: number
  isPremiumUser: boolean
}

export function DashboardTabs({ defaultTab, pendingFriendRequestsCount, isPremiumUser }: DashboardTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Define the tab order for navigation
  const tabOrder = ["attendance", "friends", "find-buddy", "global", "groups"]

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && tabOrder.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  // Render the appropriate tab content with proper loading states
  const renderTabContent = (tabValue: string) => {
    switch (tabValue) {
      case "attendance":
        return (
          <TabsContent key={tabValue} value="attendance" className="space-y-4 m-0">
            <Suspense fallback={<AttendanceTabLoading />}>
              <AttendanceTab />
            </Suspense>
          </TabsContent>
        )
      case "friends":
        return (
          <TabsContent key={tabValue} value="friends" className="space-y-4 m-0">
            <Suspense fallback={<FriendsTabLoading />}>
              <FriendsTab />
            </Suspense>
          </TabsContent>
        )
      case "find-buddy":
        return (
          <TabsContent key={tabValue} value="find-buddy" className="space-y-4 m-0">
            <Suspense fallback={<FindBuddyTabLoading />}>
              <FindBuddyTab />
            </Suspense>
          </TabsContent>
        )
      case "global":
        return (
          <TabsContent key={tabValue} value="global" className="space-y-4 m-0">
            <Suspense fallback={<GlobalTabLoading />}>
              <GlobalTab />
            </Suspense>
          </TabsContent>
        )
      case "groups":
        return (
          <TabsContent key={tabValue} value="groups" className="space-y-4 m-0">
            <Suspense fallback={<GroupsTabLoading />}>
              <GroupsTab isPremium={true} userHasPremium={isPremiumUser} />
            </Suspense>
          </TabsContent>
        )
      default:
        return (
          <TabsContent key={tabValue} value="attendance" className="space-y-4 m-0">
            <Suspense fallback={<AttendanceTabLoading />}>
              <AttendanceTab />
            </Suspense>
          </TabsContent>
        )
    }
  }

  return (
    <div className="relative pb-16">
      <Tabs value={activeTab} className="w-full">
        <div className="relative">
          {/* Render all tab contents but only show the active one */}
          {tabOrder.map((tab) => renderTabContent(tab))}
        </div>
      </Tabs>
    </div>
  )
}

