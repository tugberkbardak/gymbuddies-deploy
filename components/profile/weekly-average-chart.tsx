"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { format, parseISO } from "date-fns"

interface WeeklyAverageChartProps {
  data: {
    week: string
    average: number
    count: number
    min?: number
    max?: number
    formattedWeek?: string
  }[]
  unit: string
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    payload: {
      week: string
      average: number
      count: number
      min?: number
      max?: number
      formattedWeek?: string
    }
  }>
  label?: string
}

export default function WeeklyAverageChart({ data, unit }: WeeklyAverageChartProps) {
  const [chartData, setChartData] = useState(data)

  useEffect(() => {
    // Format the data for the chart
    const formattedData = data.map((item) => ({
      ...item,
      formattedWeek: format(parseISO(item.week), "MMM d"),
      average: Number(item.average.toFixed(1)),
      min: item.min ? Number(item.min.toFixed(1)) : undefined,
      max: item.max ? Number(item.max.toFixed(1)) : undefined,
    }))
    setChartData(formattedData)
  }, [data])

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{`Week of ${label}`}</p>
          <p>{`Average: ${data.average} ${unit}`}</p>
          {data.min !== undefined && <p>{`Min: ${data.min} ${unit}`}</p>}
          {data.max !== undefined && <p>{`Max: ${data.max} ${unit}`}</p>}
          <p>{`Entries: ${data.count}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="formattedWeek" 
          angle={-45} 
          textAnchor="end" 
          height={70} 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          label={{
            value: `Weight (${unit})`,
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#40E0D0"
          strokeWidth={2}
          dot={{ r: 4, fill: "#40E0D0", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#40E0D0", stroke: "#fff", strokeWidth: 2 }}
        />
        {chartData.map((entry, index) => (
          entry.min !== undefined && entry.max !== undefined && (
            <ReferenceLine
              key={`min-max-${index}`}
              x={entry.formattedWeek}
              segment={[
                { x: entry.formattedWeek, y: entry.min },
                { x: entry.formattedWeek, y: entry.max }
              ]}
              stroke="#20B2AA"
              strokeWidth={2}
            />
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
