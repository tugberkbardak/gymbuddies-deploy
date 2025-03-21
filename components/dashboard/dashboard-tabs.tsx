"use client"

import { useEffect, useRef, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AttendanceTab } from "@/components/dashboard/attendance-tab"
import { FriendsTab } from "@/components/dashboard/friends-tab"
import { GroupsTab } from "@/components/dashboard/groups-tab"
import { GlobalTab } from "@/components/dashboard/global-tab"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

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
  const [visibleTab, setVisibleTab] = useState(defaultTab) // Tab that's actually visible/loaded
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [isLoading, setIsLoading] = useState(false)

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

  const handleTabChange = (value: string) => {
    // Don't do anything if we're already on this tab
    if (value === activeTab) return

    // Determine slide direction based on tab indices
    const currentIndex = tabOrder.indexOf(activeTab)
    const newIndex = tabOrder.indexOf(value)

    setSlideDirection(newIndex > currentIndex ? "right" : "left")

    // Update active tab immediately (this moves the indicator)
    setActiveTab(value)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
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
          <div className={cn("transition-all duration-300 transform", isLoading ? "opacity-0" : "opacity-100")}>
            {renderTabContent()}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

