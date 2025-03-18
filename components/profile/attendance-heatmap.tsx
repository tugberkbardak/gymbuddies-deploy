"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AttendanceHeatmapProps {
  attendanceData: {
    date: string
    count: number
  }[]
}

export default function AttendanceHeatmap({ attendanceData = [] }: AttendanceHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({})
  const [year, setYear] = useState<number>(new Date().getFullYear())

  // Process attendance data into a format suitable for the heatmap
  useEffect(() => {
    const processedData: Record<string, number> = {}

    attendanceData.forEach((item) => {
      const dateStr = new Date(item.date).toISOString().split("T")[0]
      processedData[dateStr] = item.count
    })

    setHeatmapData(processedData)
  }, [attendanceData])

  // Generate dates for the entire year
  const generateYearDates = (year: number) => {
    const dates = []
    const startDate = new Date(year, 0, 1) // Jan 1
    const endDate = new Date(year, 11, 31) // Dec 31

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  const yearDates = generateYearDates(year)

  // Group dates by month and week
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Group dates by week
  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  // Find the first Monday of the year or the first day of the year
  let startIndex = 0
  while (startIndex < yearDates.length && yearDates[startIndex].getDay() !== 1) {
    startIndex++
  }

  // If no Monday is found at the beginning, start from the first day
  if (startIndex >= 7) startIndex = 0

  for (let i = startIndex; i < yearDates.length; i++) {
    if (yearDates[i].getDay() === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(yearDates[i])

    // Handle the last week
    if (i === yearDates.length - 1) {
      weeks.push(currentWeek)
    }
  }

  // Calculate the color for a cell based on attendance
  const getCellColor = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const count = heatmapData[dateStr] || 0

    if (count === 0) return "bg-gray-800"
    return "bg-[#83FFE6]" // The teal color specified in the prompt
  }

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {attendanceData.length} gym visits in {year}
        </h3>
        <div className="text-sm text-muted-foreground">{year}</div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-12"></div>
            <div className="flex flex-1 justify-between px-2">
              {months.map((month) => (
                <div key={month} className="text-xs text-muted-foreground">
                  {month}
                </div>
              ))}
            </div>
          </div>

          <div className="flex">
            <div className="w-12 pt-2">
              {weekdays.map(
                (day, i) =>
                  i % 2 === 0 && (
                    <div key={day} className="h-5 text-xs text-muted-foreground">
                      {day}
                    </div>
                  ),
              )}
            </div>

            <div className="flex-1 grid grid-flow-col gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-flow-row gap-[3px]">
                  {week.map((date, dateIndex) => (
                    <TooltipProvider key={dateIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn("w-5 h-5 rounded-sm", getCellColor(date))} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDate(date)}</p>
                          <p>
                            {heatmapData[date.toISOString().split("T")[0]]
                              ? `${heatmapData[date.toISOString().split("T")[0]]} gym visits`
                              : "No gym visits"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-center mt-2">
            <div className="text-xs text-muted-foreground mr-2">Less</div>
            <div className="bg-gray-800 w-3 h-3 rounded-sm"></div>
            <div className="bg-[#83FFE6] w-3 h-3 rounded-sm ml-1"></div>
            <div className="text-xs text-muted-foreground ml-2">More</div>
          </div>
        </div>
      </div>
    </div>
  )
}

