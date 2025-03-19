import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Attendance from "@/models/Attendance"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the target user by clerkId
    const targetUser = await User.findOne({ clerkId: params.id })
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Set default year to current year
    const year = new Date().getFullYear()

    // Create date range for the year
    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59) // December 31st 23:59:59

    // Get attendance records for the year
    const attendanceRecords = await Attendance.find({
      user: targetUser._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    // Process data for heatmap
    const heatmapData = []

    // Group by date
    const dateMap = new Map()

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date)
      const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD format

      if (dateMap.has(dateStr)) {
        dateMap.set(dateStr, dateMap.get(dateStr) + 1)
      } else {
        dateMap.set(dateStr, 1)
      }
    })

    // Convert map to array
    dateMap.forEach((count, date) => {
      heatmapData.push({ date, count })
    })

    return NextResponse.json(heatmapData)
  } catch (error) {
    console.error("Error getting user attendance heatmap:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

