import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: Request) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "2") // Default to 2 items
    const page = Number.parseInt(url.searchParams.get("page") || "1") // Default to page 1
    const skip = (page - 1) * limit

    await dbConnect()

    // Find the current user in MongoDB
    const currentUserDoc = await User.findOne({ clerkId: user.id })
    if (!currentUserDoc) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Get user's attendance records with pagination
    const attendances = await Attendance.find({
      user: currentUserDoc._id,
    })
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limit)
      .populate("user", "username firstName lastName profileImage currentStreak")

    // Get total count for pagination info
    const totalCount = await Attendance.countDocuments({
      user: currentUserDoc._id,
    })

    // Serialize the Mongoose objects
    const serializedAttendances = serializeMongooseObject(attendances)

    return NextResponse.json({
      success: true,
      data: serializedAttendances,
      pagination: {
        total: totalCount,
        page,
        limit,
        hasMore: skip + attendances.length < totalCount,
      },
    })
  } catch (error) {
    console.error("Error getting user attendance:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

