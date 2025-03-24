"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CalendarCheck, Users, UserSearch, Globe, UsersRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BottomNavigationProps {
  pendingFriendRequestsCount: number
}

export function BottomNavigation({ pendingFriendRequestsCount }: BottomNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("attendance")

  // Update active tab when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    // Don't do anything if we're already on this tab
    if (value === activeTab) return

    // Update active tab
    setActiveTab(value)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-800">
      <div className="flex justify-around items-center h-14">
        <button
          onClick={() => handleTabChange("attendance")}
          className="flex flex-col items-center justify-center w-full h-full text-white relative"
          aria-label="Attendance"
        >
          <CalendarCheck className="h-5 w-5" />
          {activeTab === "attendance" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>}
        </button>

        <button
          onClick={() => handleTabChange("friends")}
          className="flex flex-col items-center justify-center w-full h-full text-white relative"
          aria-label="Friends"
        >
          <div className="relative">
            <Users className="h-5 w-5" />
            {pendingFriendRequestsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center rounded-full text-xs px-1 bg-red-600"
              >
                {pendingFriendRequestsCount}
              </Badge>
            )}
          </div>
          {activeTab === "friends" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>}
        </button>

        <button
          onClick={() => handleTabChange("find-buddy")}
          className="flex flex-col items-center justify-center w-full h-full text-white relative"
          aria-label="Find Buddy"
        >
          <UserSearch className="h-5 w-5" />
          {activeTab === "find-buddy" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>}
        </button>

        <button
          onClick={() => handleTabChange("global")}
          className="flex flex-col items-center justify-center w-full h-full text-white relative"
          aria-label="Global"
        >
          <Globe className="h-5 w-5" />
          {activeTab === "global" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>}
        </button>

        <button
          onClick={() => handleTabChange("groups")}
          className="flex flex-col items-center justify-center w-full h-full text-white relative"
          aria-label="Groups"
        >
          <UsersRound className="h-5 w-5" />
          {activeTab === "groups" && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>}
        </button>
      </div>
    </div>
  )
}

