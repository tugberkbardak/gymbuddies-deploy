"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { Scale } from "lucide-react"

interface WeightEntry {
  _id: string
  weight: number
  date: string
  notes?: string
}

interface WeightGraphProps {
  entries: WeightEntry[]
  unit: "kg" | "lbs"
  goalWeight?: number
}

export default function WeightGraph({ entries, unit, goalWeight }: WeightGraphProps) {
  const [data, setData] = useState<any[]>([])
  const [minWeight, setMinWeight] = useState<number>(0)
  const [maxWeight, setMaxWeight] = useState<number>(100)

  // Convert kg to lbs if needed
  const convertWeight = (weight: number): number => {
    return unit === "lbs" ? weight * 2.20462 : weight
  }

  useEffect(() => {
    if (entries && entries.length > 0) {
      // Format data for the chart
      const formattedData = entries.map((entry) => ({
        date: entry.date,
        weight: convertWeight(entry.weight),
        formattedDate: format(new Date(entry.date), "MMM d, yyyy"),
      }))

      setData(formattedData)

      // Calculate min and max weight for better Y-axis scaling
      const weights = entries.map((entry) => convertWeight(entry.weight))

      // Add goal weight to the weights array if it exists
      if (goalWeight) {
        weights.push(convertWeight(goalWeight))
      }

      const min = Math.floor(Math.min(...weights) * 0.95) // 5% buffer below
      const max = Math.ceil(Math.max(...weights) * 1.05) // 5% buffer above

      setMinWeight(min)
      setMaxWeight(max)
    }
  }, [entries, unit, goalWeight])

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-md">
          <p className="font-medium">{format(new Date(label), "MMM d, yyyy")}</p>
          <p className="text-primary">
            Weight:{" "}
            <span className="font-medium">
              {payload[0].value.toFixed(1)} {unit}
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Weight Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No weight entries yet. Add your first entry to start tracking.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Weight Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM d")} minTickGap={30} />
              <YAxis domain={[minWeight, maxWeight]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#40E0D0"
                strokeWidth={2}
                dot={{ r: 4, fill: "#40E0D0", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#40E0D0", stroke: "#fff", strokeWidth: 2 }}
              />
              {goalWeight && (
                <Line
                  type="monotone"
                  dataKey={() => convertWeight(goalWeight)}
                  stroke="#FF6B6B"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Goal Weight"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {goalWeight && (
          <div className="mt-2 text-xs text-center">
            <span className="inline-block w-3 h-0.5 bg-[#FF6B6B] mr-1"></span>
            <span className="text-muted-foreground">
              Goal Weight: {convertWeight(goalWeight).toFixed(1)} {unit}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
