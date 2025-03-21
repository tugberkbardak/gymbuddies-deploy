"use client"

import { useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { GlobalTab } from "@/components/dashboard/global-tab"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
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
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")

  // Define the tab order for navigation
  const tabOrder = ["attendance", "friends", "global", "groups"]

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && tabOrder.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, tabOrder])

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Listen for resize events
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleTabChange = (value: string) => {
    // Determine slide direction based on tab indices
    const currentIndex = tabOrder.indexOf(activeTab)
    const newIndex = tabOrder.indexOf(value)

    setSlideDirection(newIndex > currentIndex ? "right" : "left")
    setActiveTab(value)

    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Touch handling for swipe navigation
  useEffect(() => {
    if (!isMobile || !containerRef.current) return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX
      handleSwipe()
    }

    const handleSwipe = () => {
      const currentTabIndex = tabOrder.indexOf(activeTab)
      if (currentTabIndex === -1) return

      // Minimum swipe distance (px)
      const minSwipeDistance = 50

      // Calculate swipe distance
      const swipeDistance = touchEndX - touchStartX

      // If the swipe is too small, ignore it
      if (Math.abs(swipeDistance) < minSwipeDistance) return

      if (swipeDistance > 0) {
        // Swiped right (go to previous tab)
        if (currentTabIndex > 0) {
          handleTabChange(tabOrder[currentTabIndex - 1])
        }
      } else {
        // Swiped left (go to next tab)
        if (currentTabIndex < tabOrder.length - 1) {
          handleTabChange(tabOrder[currentTabIndex + 1])
        }
      }
    }

    const element = containerRef.current
    element.addEventListener("touchstart", handleTouchStart, { passive: true })
    element.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, activeTab, tabOrder])

  // Calculate indicator position based on active tab
  const getIndicatorStyle = () => {
    const index = tabOrder.indexOf(activeTab)
    return {
      left: `${index * 25}%`,
      width: "25%",
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
        <div className="relative">
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

          {/* Animated indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300 ease-spring"
            style={getIndicatorStyle()}
          />
        </div>

        <div className="relative overflow-hidden">
          {/* Attendance Tab */}
          <div
            className={cn(
              "transition-all duration-300 transform",
              activeTab === "attendance" ? "translate-x-0 opacity-100" : "absolute inset-0 opacity-0",
              activeTab !== "attendance" && slideDirection === "left"
                ? "-translate-x-full"
                : activeTab !== "attendance"
                  ? "translate-x-full"
                  : "",
            )}
          >
            {(activeTab === "attendance" || activeTab === "friends") && (
              <TabsContent value="attendance" forceMount className="space-y-4">
                <AttendanceTab />
              </TabsContent>
            )}
          </div>

          {/* Friends Tab */}
          <div
            className={cn(
              "transition-all duration-300 transform",
              activeTab === "friends" ? "translate-x-0 opacity-100" : "absolute inset-0 opacity-0",
              activeTab !== "friends" && slideDirection === "left"
                ? "-translate-x-full"
                : activeTab !== "friends"
                  ? "translate-x-full"
                  : "",
            )}
          >
            {(activeTab === "friends" || activeTab === "attendance" || activeTab === "global") && (
              <TabsContent value="friends" forceMount className="space-y-4">
                <FriendsTab />
              </TabsContent>
            )}
          </div>

          {/* Global Tab */}
          <div
            className={cn(
              "transition-all duration-300 transform",
              activeTab === "global" ? "translate-x-0 opacity-100" : "absolute inset-0 opacity-0",
              activeTab !== "global" && slideDirection === "left"
                ? "-translate-x-full"
                : activeTab !== "global"
                  ? "translate-x-full"
                  : "",
            )}
          >
            {(activeTab === "global" || activeTab === "friends" || activeTab === "groups") && (
              <TabsContent value="global" forceMount className="space-y-4">
                <GlobalTab />
              </TabsContent>
            )}
          </div>

          {/* Groups Tab */}
          <div
            className={cn(
              "transition-all duration-300 transform",
              activeTab === "groups" ? "translate-x-0 opacity-100" : "absolute inset-0 opacity-0",
              activeTab !== "groups" && slideDirection === "left"
                ? "-translate-x-full"
                : activeTab !== "groups"
                  ? "translate-x-full"
                  : "",
            )}
          >
            {(activeTab === "groups" || activeTab === "global") && (
              <TabsContent value="groups" forceMount className="space-y-4">
                <GroupsTab isPremium={true} userHasPremium={isPremiumUser} />
              </TabsContent>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

