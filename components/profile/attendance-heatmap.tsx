"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

interface AttendanceHeatmapProps {
  attendanceData: {
    date: string
    count: number
  }[]
}

export default function AttendanceHeatmap({ attendanceData = [] }: AttendanceHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({})
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [monthlyStats, setMonthlyStats] = useState<
    Array<{
      name: string
      shortName: string
      daysInMonth: number
      daysAttended: number
      percentage: number
    }>
  >([])

  // Process attendance data into a format suitable for the heatmap
  useEffect(() => {
    const processedData: Record<string, number> = {}

    attendanceData.forEach((item) => {
      // Create a date object and ensure we're using local timezone
      const date = new Date(item.date)
      // Format to YYYY-MM-DD in local timezone
      const dateStr = date.toLocaleDateString("en-CA") // en-CA uses YYYY-MM-DD format
      processedData[dateStr] = item.count
    })

    setHeatmapData(processedData)

    // Calculate monthly statistics
    const months = [
      { name: "January", shortName: "Jan" },
      { name: "February", shortName: "Feb" },
      { name: "March", shortName: "Mar" },
      { name: "April", shortName: "Apr" },
      { name: "May", shortName: "May" },
      { name: "June", shortName: "Jun" },
      { name: "July", shortName: "Jul" },
      { name: "August", shortName: "Aug" },
      { name: "September", shortName: "Sep" },
      { name: "October", shortName: "Oct" },
      { name: "November", shortName: "Nov" },
      { name: "December", shortName: "Dec" },
    ]

    const stats = months.map((month, index) => {
      // Get days in month
      const daysInMonth = new Date(year, index + 1, 0).getDate()

      // Count days attended in this month
      let daysAttended = 0
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, index, day)
        const dateStr = date.toLocaleDateString("en-CA") // Use consistent date format
        if (processedData[dateStr]) {
          daysAttended++
        }
      }

      // Calculate percentage
      const percentage = daysInMonth > 0 ? (daysAttended / daysInMonth) * 100 : 0

      return {
        name: month.name,
        shortName: month.shortName,
        daysInMonth,
        daysAttended,
        percentage,
      }
    })

    setMonthlyStats(stats)
  }, [attendanceData, year])

  // Generate dates for the entire year (for desktop view)
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

  // Group dates by month and week for desktop view
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Create a more consistent grid of weeks
  const createWeekGrid = () => {
    // Start with the first day of the year
    const firstDay = new Date(year, 0, 1)

    // Find the first Monday (or go back to the previous year's last days if needed)
    const firstMonday = new Date(firstDay)
    while (firstMonday.getDay() !== 1) {
      // 1 is Monday
      firstMonday.setDate(firstMonday.getDate() - 1)
    }

    // Create a grid with exactly 53 weeks (max possible in a year) and 7 days per week
    const grid: Date[][] = []

    // Start from the first Monday
    const currentDate = new Date(firstMonday)

    // Create 53 weeks
    for (let week = 0; week < 53; week++) {
      const weekDates: Date[] = []

      // 7 days per week
      for (let day = 0; day < 7; day++) {
        weekDates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      grid.push(weekDates)

      // Stop if we've gone past the end of the year
      if (currentDate.getFullYear() > year) {
        break
      }
    }

    return grid
  }

  const weekGrid = createWeekGrid()

  // Calculate the color for a cell based on attendance
  const getCellColor = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-CA")
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

  // Check if a date is in the current year
  const isInCurrentYear = (date: Date) => {
    return date.getFullYear() === year
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {attendanceData.length} gym visits in {year}
        </h3>
        <div className="text-sm text-muted-foreground">{year}</div>
      </div>

      {/* Mobile-optimized view with progress bars */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {monthlyStats.map((month) => (
            <div key={month.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">{month.name}</div>
                <div className="text-xs text-muted-foreground">
                  {month.daysAttended}/{month.daysInMonth} days ({Math.round(month.percentage)}%)
                </div>
              </div>
              <Progress
                value={month.percentage}
                className="h-2"
                indicatorClassName={month.percentage > 0 ? "bg-[#83FFE6]" : ""}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop view - only shown on md screens and up */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-6"></div> {/* Reduced width, no weekday labels */}
            <div className="flex flex-1 justify-between px-2">
              {months.map((month) => (
                <div key={month} className="text-xs text-muted-foreground">
                  {month}
                </div>
              ))}
            </div>
          </div>

          <div className="flex">
            {/* Empty space where weekday labels were */}
            <div className="w-6"></div>

            {/* Grid for the heatmap cells with consistent spacing */}
            <div className="flex-1 grid grid-cols-53 gap-x-[2px]">
              {weekGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-y-[2px]">
                  {week.map((date, dayIndex) => (
                    <TooltipProvider key={dayIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-4 h-4 rounded-sm",
                              isInCurrentYear(date) ? getCellColor(date) : "bg-transparent",
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDate(date)}</p>
                          <p>
                            {isInCurrentYear(date) && heatmapData[date.toLocaleDateString("en-CA")]
                              ? `${heatmapData[date.toLocaleDateString("en-CA")]} gym visits`
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
            <div className="text-xs text-muted-foreground mr-2">Not</div>
            <div className="bg-gray-800 w-3 h-3 rounded-sm"></div>
            <div className="bg-[#83FFE6] w-3 h-3 rounded-sm ml-1"></div>
            <div className="text-xs text-muted-foreground ml-2">Attended</div>
          </div>
        </div>
      </div>
    </div>
  )
}

