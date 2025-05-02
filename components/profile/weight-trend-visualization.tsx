"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"
import { TrendingDown, TrendingUp } from "lucide-react"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface WeightTrendVisualizationProps {
  entries: WeightEntry[]
  unit: string
}

export function WeightTrendVisualization({ entries, unit }: WeightTrendVisualizationProps) {
  if (entries.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Weight Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40 text-center">
          <p className="text-muted-foreground">Need at least 2 entries to show trend</p>
        </CardContent>
      </Card>
    )
  }

  // Sort entries by date (oldest first for chart)
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Prepare data for chart
  const chartData = sortedEntries.map((entry) => ({
    date: format(parseISO(entry.date), "MMM d"),
    weight: entry.weight,
    fullDate: entry.date,
  }))

  // Calculate trend
  const firstWeight = sortedEntries[0].weight
  const lastWeight = sortedEntries[sortedEntries.length - 1].weight
  const weightDifference = lastWeight - firstWeight
  const isDownwardTrend = weightDifference < 0

  // Calculate trendline data
  const trendData = []
  if (sortedEntries.length >= 2) {
    const firstDate = new Date(sortedEntries[0].date).getTime()
    const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date).getTime()
    const dateRange = lastDate - firstDate
    const weightRange = lastWeight - firstWeight

    // Create trendline points
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i]
      const entryDate = new Date(entry.date).getTime()
      const progress = (entryDate - firstDate) / dateRange
      const trendWeight = firstWeight + weightRange * progress

      trendData.push({
        date: format(parseISO(entry.date), "MMM d"),
        trend: trendWeight,
        fullDate: entry.date,
      })
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-md p-2 text-sm">
          <p className="font-medium">{format(parseISO(data.fullDate), "MMM d, yyyy")}</p>
          <p className="text-primary">{`Weight: ${payload[0].value} ${unit}`}</p>
          {payload[1] && <p className="text-muted-foreground">{`Trend: ${payload[1].value.toFixed(1)} ${unit}`}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span>Weight Trend</span>
          <span
            className={`inline-flex items-center text-xs font-medium ${
              isDownwardTrend ? "text-green-500" : "text-red-500"
            }`}
          >
            {isDownwardTrend ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
            {Math.abs(weightDifference).toFixed(1)} {unit} {isDownwardTrend ? "loss" : "gain"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12 }} tickMargin={10} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                data={trendData}
                dataKey="trend"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
