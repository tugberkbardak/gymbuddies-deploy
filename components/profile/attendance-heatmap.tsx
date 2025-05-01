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

  useEffect(() => {
    const processedData: Record<string, number> = {}

    attendanceData.forEach((item) => {
      const date = new Date(item.date)
      const dateStr = date.toLocaleDateString("en-CA")
      processedData[dateStr] = item.count
    })

    setHeatmapData(processedData)

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
      const daysInMonth = new Date(year, index + 1, 0).getDate()

      let daysAttended = 0
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, index, day)
        const dateStr = date.toLocaleDateString("en-CA")
        if (processedData[dateStr]) {
          daysAttended++
        }
      }

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

  const generateYearDates = (year: number) => {
    const dates = []
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  const yearDates = generateYearDates(year)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const createWeekGrid = () => {
    const firstDay = new Date(year, 0, 1)
    const firstMonday = new Date(firstDay)
    while (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() - 1)
    }

    const grid: Date[][] = []
    const currentDate = new Date(firstMonday)

    for (let week = 0; week < 53; week++) {
      const weekDates: Date[] = []

      for (let day = 0; day < 7; day++) {
        weekDates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      grid.push(weekDates)

      if (currentDate.getFullYear() > year) {
        break
      }
    }

    return grid
  }

  const weekGrid = createWeekGrid()

  const getCellColor = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-CA")
    const count = heatmapData[dateStr] || 0

    if (count === 0) return "bg-gray-800"
    return "bg-[#83FFE6]"
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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

        <div className="overflow-x-auto mt-4">
          <div className="min-w-[950px]">
            <div className="flex">
              <div className="w-6"></div>
              <div className="flex flex-1 justify-between px-2">
                {months.map((month) => (
                  <div key={month} className="text-xs text-muted-foreground">
                    {month}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex">
              <div className="w-6"></div>
              <div className="flex-1 grid grid-cols-53 gap-x-[6px]">
                {weekGrid.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-y-[10px]">
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

      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="flex">
            <div className="w-6"></div>
            <div className="flex flex-1 justify-between px-2">
              {months.map((month) => (
                <div key={month} className="text-xs text-muted-foreground">
                  {month}
                </div>
              ))}
            </div>
          </div>
          <div className="flex">
            <div className="w-6"></div>
            <div className="flex-1 grid grid-cols-53 gap-x-[4px]">
              {weekGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-y-[6px]">
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
