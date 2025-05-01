"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface WeightEntry {
  _id: string
  weight: number
  date: string
}

interface WeightSummaryProps {
  entries: WeightEntry[]
  unit: "kg" | "lbs"
  goalWeight?: number
}

export default function WeightSummary({ entries, unit, goalWeight }: WeightSummaryProps) {
  // Convert kg to lbs if needed
  const convertWeight = (weight: number): number => {
    return unit === "lbs" ? weight * 2.20462 : weight
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Get current and previous weight
  const currentWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : null
  const previousWeight = sortedEntries.length > 1 ? sortedEntries[1].weight : null

  // Calculate weight change
  const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null
  const weightChangePercent = currentWeight && previousWeight ? (weightChange / previousWeight) * 100 : null

  // Determine trend
  let trend = null
  let trendIcon = <Minus className="h-4 w-4" />
  let trendColor = "text-muted-foreground"

  if (weightChange !== null) {
    if (weightChange > 0) {
      trend = "increase"
      trendIcon = <TrendingUp className="h-4 w-4" />
      trendColor = "text-red-500"
    } else if (weightChange < 0) {
      trend = "decrease"
      trendIcon = <TrendingDown className="h-4 w-4" />
      trendColor = "text-green-500"
    }
  }

  // Calculate progress towards goal if goal exists
  let goalProgress = null
  if (goalWeight && currentWeight) {
    const initialWeight = sortedEntries[sortedEntries.length - 1].weight // First recorded weight
    const totalToLose = initialWeight - goalWeight

    if (totalToLose > 0) {
      const lost = initialWeight - currentWeight
      goalProgress = (lost / totalToLose) * 100
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Weight Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentWeight ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-2xl font-bold">
                  {convertWeight(currentWeight).toFixed(1)} {unit}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {format(new Date(sortedEntries[0].date), "MMM d, yyyy")}
                </p>
              </div>
              {weightChange !== null && (
                <div className={`text-right ${trendColor}`}>
                  <div className="flex items-center gap-1 justify-end">
                    {trendIcon}
                    <span className="font-medium">
                      {weightChange > 0 ? "+" : ""}
                      {convertWeight(weightChange).toFixed(1)} {unit}
                    </span>
                  </div>
                  <p className="text-xs">
                    {weightChangePercent > 0 ? "+" : ""}
                    {weightChangePercent.toFixed(1)}% since last entry
                  </p>
                </div>
              )}
            </div>

            {goalWeight && goalProgress !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Goal Progress</span>
                  <span>{Math.min(Math.round(goalProgress), 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${Math.min(goalProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Current: {convertWeight(currentWeight).toFixed(1)} {unit}
                  </span>
                  <span>
                    Goal: {convertWeight(goalWeight).toFixed(1)} {unit}
                  </span>
                </div>
              </div>
            )}

            {entries.length > 1 && (
              <div className="h-[100px] w-full bg-muted/30 rounded-md flex items-end">
                {entries
                  .slice(0, 7)
                  .reverse()
                  .map((entry, index) => {
                    // Find min and max for scaling
                    const weights = entries.slice(0, 7).map((e) => e.weight)
                    const min = Math.min(...weights)
                    const max = Math.max(...weights)
                    const range = max - min || 1 // Avoid division by zero

                    // Calculate height percentage based on weight value
                    const heightPercent = ((entry.weight - min) / range) * 70 + 20 // Min height 20%, max 90%

                    return (
                      <div key={entry._id} className="flex-1 mx-0.5 flex flex-col items-center justify-end">
                        <div
                          className={`w-full max-w-[30px] bg-primary rounded-t-sm`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                        <p className="text-xs mt-1 text-muted-foreground truncate w-full text-center">
                          {format(new Date(entry.date), "d/M")}
                        </p>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No weight entries yet.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/profile/weight">View Weight History</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
