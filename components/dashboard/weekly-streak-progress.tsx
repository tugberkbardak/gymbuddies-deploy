"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { startOfWeek, endOfWeek, format, isAfter, subWeeks } from "date-fns"

export function WeeklyStreakProgress() {
  const [weeklyAttendances, setWeeklyAttendances] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weekRange, setWeekRange] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Calculate current week range
        const today = new Date()
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

        setWeekRange(`${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`)

        // Fetch attendances for the current week
        const weeklyResponse = await fetch(`/api/attendance/weekly-count`)

        if (!weeklyResponse.ok) {
          throw new Error("Failed to fetch weekly attendances")
        }

        const weeklyData = await weeklyResponse.json()
        setWeeklyAttendances(weeklyData.count || 0)

        // Fetch current streak
        const profileResponse = await fetch(`/api/users/me`)

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()

          // Check if we need to reset the streak
          // If we're in a new week and the user has a streak but hasn't been to the gym this week
          if (profileData.currentStreak > 0 && weeklyData.count === 0) {
            // Get the last attendance date
            const lastAttendanceResponse = await fetch(`/api/attendance?limit=1`)
            if (lastAttendanceResponse.ok) {
              const lastAttendanceData = await lastAttendanceResponse.json()

              if (lastAttendanceData.attendances && lastAttendanceData.attendances.length > 0) {
                const lastAttendanceDate = new Date(lastAttendanceData.attendances[0].date)

                // If the last attendance was before this week started and they had less than 3 visits last week
                if (isAfter(weekStart, lastAttendanceDate)) {
                  // Check last week's attendance
                  const lastWeekStart = subWeeks(weekStart, 1)
                  const lastWeekEnd = subWeeks(weekEnd, 1)

                  const lastWeekResponse = await fetch(
                    `/api/attendance/count?start=${lastWeekStart.toISOString()}&end=${lastWeekEnd.toISOString()}`,
                  )

                  if (lastWeekResponse.ok) {
                    const lastWeekData = await lastWeekResponse.json()

                    if (lastWeekData.count < 3) {
                      // Reset streak
                      await fetch(`/api/users/me/reset-streak`, { method: "POST" })
                      setCurrentStreak(0)
                      return
                    }
                  }
                }
              }
            }
          }

          setCurrentStreak(profileData.currentStreak || 0)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate progress percentage (max 100%)
  const progressPercentage = Math.min((weeklyAttendances / 3) * 100, 100)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Weekly Streak Progress</CardTitle>
        </CardHeader>
        <CardContent className="py-2 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium">Weekly Streak Progress</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{weeklyAttendances}/3 gym visits this week</span>
            <span className="text-muted-foreground">{weekRange}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" indicatorClassName="bg-[#83FFE6]" />
          <p className="text-xs text-muted-foreground">
            {weeklyAttendances >= 3
              ? "You've earned your streak for this week! 🎉"
              : `${3 - weeklyAttendances} more visits needed this week to maintain your streak`}
          </p>

          {/* Only show current streak if it's greater than 0 */}
          {currentStreak > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Current streak:{" "}
              <span className="font-medium">
                {currentStreak} {currentStreak === 1 ? "week" : "weeks"}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

