import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"
import { startOfWeek, endOfWeek } from "date-fns"

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
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

    // Count attendances for the current week
    const count = await Attendance.countDocuments({
      user: dbUser._id,
      date: { $gte: weekStart, $lte: weekEnd },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error getting weekly attendance count:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

