"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, parseISO } from "date-fns"

interface WeeklyAverageChartProps {
  data: {
    week: string
    average: number
    count: number
  }[]
  unit: string
}

export default function WeeklyAverageChart({ data, unit }: WeeklyAverageChartProps) {
  const [chartData, setChartData] = useState(data)

  useEffect(() => {
    // Format the data for the chart
    const formattedData = data.map((item) => ({
      ...item,
      formattedWeek: format(parseISO(item.week), "MMM d"),
      average: Number(item.average.toFixed(1)),
    }))
    setChartData(formattedData)
  }, [data])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{`Week of ${label}`}</p>
          <p>{`Average: ${payload[0].value} ${unit}`}</p>
          <p>{`Entries: ${payload[0].payload.count}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="formattedWeek" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
        <YAxis
          label={{
            value: `Weight (${unit})`,
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="average" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
