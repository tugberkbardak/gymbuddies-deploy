"use client"

import { useEffect, useRef, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { GlobalTab } from "@/components/dashboard/global-tab"
import { FindBuddyTab } from "@/components/dashboard/find-buddy-tab"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardTabsProps {
  defaultTab: string
  pendingFriendRequestsCount: number
  isPremiumUser: boolean
}

export function DashboardTabs({ defaultTab, pendingFriendRequestsCount, isPremiumUser }: DashboardTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [visibleTab, setVisibleTab] = useState(defaultTab) // Tab that's actually visible/loaded
  const [isLoading, setIsLoading] = useState(false)

  // Define the tab order for navigation
  const tabOrder = ["attendance", "friends", "find-buddy", "global", "groups"]

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && tabOrder.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, tabOrder])

  // Handle loading the tab content after the tab indicator has moved
  useEffect(() => {
    if (activeTab !== visibleTab) {
      setIsLoading(true)

      // Use a short timeout to allow the tab indicator to move first
      const timer = setTimeout(() => {
        setVisibleTab(activeTab)
        setIsLoading(false)
      }, 300) // Slightly shorter than the animation duration

      return () => clearTimeout(timer)
    }
  }, [activeTab, visibleTab])

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )

  // Render the appropriate tab content
  const renderTabContent = () => {
    if (isLoading) {
      return renderLoadingState()
    }

    switch (visibleTab) {
      case "attendance":
        return (
          <TabsContent value="attendance" forceMount className="space-y-4 block">
            <AttendanceTab />
          </TabsContent>
        )
      case "friends":
        return (
          <TabsContent value="friends" forceMount className="space-y-4 block">
            <FriendsTab />
          </TabsContent>
        )
      case "find-buddy":
        return (
          <TabsContent value="find-buddy" forceMount className="space-y-4 block">
            <FindBuddyTab />
          </TabsContent>
        )
      case "global":
        return (
          <TabsContent value="global" forceMount className="space-y-4 block">
            <GlobalTab />
          </TabsContent>
        )
      case "groups":
        return (
          <TabsContent value="groups" forceMount className="space-y-4 block">
            <GroupsTab isPremium={true} userHasPremium={isPremiumUser} />
          </TabsContent>
        )
      default:
        return (
          <TabsContent value="attendance" forceMount className="space-y-4 block">
            <AttendanceTab />
          </TabsContent>
        )
    }
  }

  return (
    <div ref={containerRef} className="relative pb-16">
      <Tabs value={activeTab} className="w-full">
        <div className="relative overflow-hidden">
          <div className={cn("transition-all duration-300 transform", isLoading ? "opacity-0" : "opacity-100")}>
            {renderTabContent()}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

