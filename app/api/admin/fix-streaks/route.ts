import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Attendance from "@/models/Attendance"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"

export async function POST() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you'd check if the user is an admin
    // For now, we'll allow any authenticated user to run this

    await dbConnect()

    // Get all users with streaks > 0
    const usersWithStreaks = await User.find({ currentStreak: { $gt: 0 } })

    const today = new Date()
    let updatedCount = 0

    for (const user of usersWithStreaks) {
      // Get total attendance count
      const totalAttendance = await Attendance.countDocuments({ user: user._id })

      // If total attendance is less than 3 * streak, the streak is invalid
      if (totalAttendance < user.currentStreak * 3) {
        // Calculate what the streak should be
        const validStreak = Math.floor(totalAttendance / 3)

        // Check if the most recent week has 3+ attendances
        const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })
        const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 })

        const currentWeekAttendances = await Attendance.countDocuments({
          user: user._id,
          date: { $gte: currentWeekStart, $lte: currentWeekEnd },
        })

        // Check previous weeks as needed
        let weekOffset = 0
        let consecutiveWeeks = 0

        while (true) {
          const weekStart = startOfWeek(subWeeks(today, weekOffset), { weekStartsOn: 1 })
          const weekEnd = endOfWeek(subWeeks(today, weekOffset), { weekStartsOn: 1 })

          const weekAttendances = await Attendance.countDocuments({
            user: user._id,
            date: { $gte: weekStart, $lte: weekEnd },
          })

          if (weekAttendances >= 3) {
            consecutiveWeeks++
          } else {
            break
          }

          weekOffset++
        }

        // Update the user's streak
        user.currentStreak = consecutiveWeeks
        await user.save()
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} users with invalid streaks`,
    })
  } catch (error) {
    console.error("Error fixing streaks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

