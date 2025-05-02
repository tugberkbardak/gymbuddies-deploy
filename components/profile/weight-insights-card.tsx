"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Scale, Calendar } from "lucide-react"
import { format, parseISO, differenceInDays } from "date-fns"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface WeightInsightsCardProps {
  entries: WeightEntry[]
  unit: string
}

export function WeightInsightsCard({ entries, unit }: WeightInsightsCardProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40 text-center">
            <p className="text-muted-foreground">Add weight entries to see insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate insights
  const currentWeight = sortedEntries[0].weight
  const oldestEntry = sortedEntries[sortedEntries.length - 1]
  const oldestWeight = oldestEntry.weight

  // Calculate average weekly change
  const totalDays = differenceInDays(new Date(sortedEntries[0].date), new Date(oldestEntry.date)) || 1 // Avoid division by zero

  const totalChange = currentWeight - oldestWeight
  const weeklyChange = (totalChange / totalDays) * 7

  // Calculate highest and lowest weights
  const highestWeight = Math.max(...sortedEntries.map((entry) => entry.weight))
  const lowestWeight = Math.min(...sortedEntries.map((entry) => entry.weight))

  // Find dates for highest and lowest weights
  const highestEntry = sortedEntries.find((entry) => entry.weight === highestWeight)
  const lowestEntry = sortedEntries.find((entry) => entry.weight === lowestWeight)

  // Format dates
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy")
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium mb-4 flex items-center">
          <Scale className="h-5 w-5 mr-2 text-primary" />
          Weight Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Change */}
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Weekly Change</p>
              {weeklyChange !== 0 && (
                <span
                  className={`flex items-center text-xs font-medium ${
                    weeklyChange < 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {weeklyChange < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(weeklyChange).toFixed(2)} {unit}/week
                </span>
              )}
            </div>
            <div className="flex items-center mt-1">
              <p
                className={`text-lg font-bold ${
                  weeklyChange < 0 ? "text-green-500" : weeklyChange > 0 ? "text-red-500" : ""
                }`}
              >
                {weeklyChange === 0
                  ? "No change"
                  : `${weeklyChange < 0 ? "Losing" : "Gaining"} ${Math.abs(weeklyChange).toFixed(2)} ${unit}/week`}
              </p>
            </div>
          </div>

          {/* Total Change */}
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Change</p>
              <span
                className={`flex items-center text-xs font-medium ${
                  totalChange < 0 ? "text-green-500" : totalChange > 0 ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {totalChange < 0 ? (
                  <ArrowDown className="h-3 w-3 mr-1" />
                ) : totalChange > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : null}
                {Math.abs(totalChange).toFixed(1)} {unit}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <p className="text-lg font-bold">
                From {oldestWeight} {unit} to {currentWeight} {unit}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Since {formatDate(oldestEntry.date)}
            </p>
          </div>

          {/* Highest Weight */}
          <div className="bg-muted/30 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Highest Weight</p>
            <p className="text-lg font-bold">
              {highestWeight} {unit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              {highestEntry ? formatDate(highestEntry.date) : "N/A"}
            </p>
          </div>

          {/* Lowest Weight */}
          <div className="bg-muted/30 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Lowest Weight</p>
            <p className="text-lg font-bold">
              {lowestWeight} {unit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              {lowestEntry ? formatDate(lowestEntry.date) : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
