import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"
import { startOfWeek, endOfWeek, subWeeks, isAfter } from "date-fns"

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })
    if (!dbUser) {
      return NextResponse.json({ count: 0 })
    }

    // Calculate current week range
    const today = new Date()
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 })

    // Count attendances for the current week
    const count = await Attendance.countDocuments({
      user: dbUser._id,
      date: { $gte: currentWeekStart, $lte: currentWeekEnd },
    })

    // Check if we need to reset the streak due to inactivity
    // If we're in a new week and the user had less than 3 attendances in the previous week
    const lastWeekStart = subWeeks(currentWeekStart, 1)
    const lastWeekEnd = subWeeks(currentWeekEnd, 1)

    // Get the most recent attendance
    const mostRecentAttendance = await Attendance.findOne({ user: dbUser._id }).sort({ date: -1 })

    // If the most recent attendance is from before the current week start
    // and the user has a streak, we need to check if they met the requirement last week
    if (
      mostRecentAttendance &&
      isAfter(currentWeekStart, new Date(mostRecentAttendance.date)) &&
      dbUser.currentStreak > 0
    ) {
      // Count attendances for the previous week
      const lastWeekAttendances = await Attendance.countDocuments({
        user: dbUser._id,
        date: { $gte: lastWeekStart, $lte: lastWeekEnd },
      })

      // If they didn't meet the requirement last week, reset their streak
      if (lastWeekAttendances < 3) {
        dbUser.currentStreak = 0
        await dbUser.save()
      }
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error getting weekly attendance count:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

