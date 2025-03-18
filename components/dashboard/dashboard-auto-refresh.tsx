"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Check if this is the first load after signup
    const isFirstLoad = sessionStorage.getItem("dashboard_first_load") !== "false"

    if (isFirstLoad) {
      // Set the flag to prevent future refreshes
      sessionStorage.setItem("dashboard_first_load", "false")

      // Add a small delay before refreshing to ensure all components are mounted
      const refreshTimer = setTimeout(() => {
        console.log("Auto-refreshing dashboard for new user...")
        router.refresh()
      }, 1000)

      return () => clearTimeout(refreshTimer)
    }
  }, [router])

  // This component doesn't render anything
  return null
}

