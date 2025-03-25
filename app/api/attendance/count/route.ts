import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"

export async function GET(req: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    // Validate parameters
    if (!start || !end) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }

    // Parse dates
    const startDate = new Date(start)
    const endDate = new Date(end)

    // Count attendances for the specified date range
    const count = await Attendance.countDocuments({
      user: dbUser._id,
      date: { $gte: startDate, $lte: endDate },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting attendances:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

