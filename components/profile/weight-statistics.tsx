"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Dumbbell, TrendingDown, TrendingUp } from "lucide-react"
import { format, subMonths, isAfter } from "date-fns"

interface WeightEntry {
  _id: string
  weight: number
  date: string
}

interface WeightStatisticsProps {
  entries: WeightEntry[]
  unit: "kg" | "lbs"
  goalWeight?: number
  goalDate?: string
}

export default function WeightStatistics({ entries, unit, goalWeight, goalDate }: WeightStatisticsProps) {
  const [stats, setStats] = useState({
    current: 0,
    highest: 0,
    lowest: 0,
    average: 0,
    monthlyChange: 0,
    totalChange: 0,
    goalProgress: 0,
    daysToGoal: 0,
    projectedDate: null as Date | null,
  })

  // Convert kg to lbs if needed
  const convertWeight = (weight: number): number => {
    return unit === "lbs" ? weight * 2.20462 : weight
  }

  // Format weight with unit
  const formatWeight = (weight: number): string => {
    return `${convertWeight(weight).toFixed(1)} ${unit}`
  }

  useEffect(() => {
    if (entries.length === 0) return

    // Sort entries by date (oldest first for calculations)
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Get current weight (most recent entry)
    const currentWeight = sortedEntries[sortedEntries.length - 1].weight

    // Calculate highest and lowest weights
    const weights = sortedEntries.map((entry) => entry.weight)
    const highestWeight = Math.max(...weights)
    const lowestWeight = Math.min(...weights)

    // Calculate average weight
    const averageWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length

    // Calculate monthly change
    const oneMonthAgo = subMonths(new Date(), 1)
    const entriesLastMonth = sortedEntries.filter((entry) => isAfter(new Date(entry.date), oneMonthAgo))
    let monthlyChange = 0

    if (entriesLastMonth.length >= 2) {
      const oldestInMonth = entriesLastMonth[0].weight
      const newestInMonth = entriesLastMonth[entriesLastMonth.length - 1].weight
      monthlyChange = newestInMonth - oldestInMonth
    }

    // Calculate total change since first entry
    const totalChange = currentWeight - sortedEntries[0].weight

    // Calculate goal progress if goal exists
    let goalProgress = 0
    let daysToGoal = 0
    let projectedDate = null

    if (goalWeight) {
      const totalWeightToLose = sortedEntries[0].weight - goalWeight
      const weightLost = sortedEntries[0].weight - currentWeight

      if (totalWeightToLose > 0) {
        goalProgress = (weightLost / totalWeightToLose) * 100

        // Calculate projected completion date based on current rate
        if (totalChange !== 0 && sortedEntries.length >= 2) {
          const oldestDate = new Date(sortedEntries[0].date)
          const newestDate = new Date(sortedEntries[sortedEntries.length - 1].date)
          const daysPassed = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
          const weightChangePerDay = Math.abs(totalChange) / daysPassed

          if (weightChangePerDay > 0) {
            const remainingWeight = Math.abs(currentWeight - goalWeight)
            daysToGoal = Math.ceil(remainingWeight / weightChangePerDay)

            const today = new Date()
            projectedDate = new Date(today.setDate(today.getDate() + daysToGoal))
          }
        }
      }
    }

    setStats({
      current: currentWeight,
      highest: highestWeight,
      lowest: lowestWeight,
      average: averageWeight,
      monthlyChange,
      totalChange,
      goalProgress: Math.min(Math.max(goalProgress, 0), 100), // Clamp between 0-100
      daysToGoal,
      projectedDate,
    })
  }, [entries, goalWeight])

  if (entries.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Weight Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Weight</p>
            <p className="text-xl font-bold">{formatWeight(stats.current)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Average Weight</p>
            <p className="text-xl font-bold">{formatWeight(stats.average)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Highest Weight</p>
            <p className="text-xl font-bold">{formatWeight(stats.highest)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Lowest Weight</p>
            <p className="text-xl font-bold">{formatWeight(stats.lowest)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">30-Day Change</p>
            <div
              className={`flex items-center gap-1 ${
                stats.monthlyChange < 0 ? "text-green-500" : stats.monthlyChange > 0 ? "text-red-500" : ""
              }`}
            >
              {stats.monthlyChange < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : stats.monthlyChange > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : null}
              <p className="text-xl font-bold">
                {stats.monthlyChange === 0
                  ? "No change"
                  : `${stats.monthlyChange > 0 ? "+" : ""}${formatWeight(stats.monthlyChange)}`}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Change</p>
            <div
              className={`flex items-center gap-1 ${
                stats.totalChange < 0 ? "text-green-500" : stats.totalChange > 0 ? "text-red-500" : ""
              }`}
            >
              {stats.totalChange < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : stats.totalChange > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : null}
              <p className="text-xl font-bold">
                {stats.totalChange === 0
                  ? "No change"
                  : `${stats.totalChange > 0 ? "+" : ""}${formatWeight(stats.totalChange)}`}
              </p>
            </div>
          </div>
        </div>

        {goalWeight && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                <p className="font-medium">Goal Progress</p>
              </div>
              <p className="text-sm font-medium">{Math.round(stats.goalProgress)}%</p>
            </div>

            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${stats.goalProgress}%` }}></div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current: {formatWeight(stats.current)}</span>
              <span>Goal: {formatWeight(goalWeight)}</span>
            </div>

            {stats.projectedDate && (
              <p className="text-xs text-muted-foreground mt-2">
                At your current rate, you'll reach your goal in approximately {stats.daysToGoal} days (
                {format(stats.projectedDate, "MMMM d, yyyy")})
              </p>
            )}

            {goalDate && (
              <p className="text-xs text-muted-foreground">
                Your target date: {format(new Date(goalDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
