import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get form data
    const formData = await req.formData()

    // Extract form data
    const gymName = formData.get("gymName") as string
    const locationName = formData.get("locationName") as string
    const notes = formData.get("notes") as string
    const imageData = formData.get("imageData") as string

    // Parse coordinates
    let coordinates = { lat: 0, lng: 0 }
    try {
      const coordinatesStr = formData.get("coordinates") as string
      if (coordinatesStr) {
        coordinates = JSON.parse(coordinatesStr)
      }
    } catch (error) {
      console.error("Error parsing coordinates:", error)
      return NextResponse.json({ error: "Invalid coordinates format" }, { status: 400 })
    }

    // Validate required fields
    if (!gymName || !locationName) {
      return NextResponse.json({ error: "Gym name and location are required" }, { status: 400 })
    }

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      user: dbUser._id,
      date: new Date(),
      gymName,
      location: locationName,
      coordinates,
      notes,
      image: imageData,
      points: 1, // Default to 1 point if not specified
    })

    await newAttendance.save()

    // Update user stats
    dbUser.totalAttendance += 1
    dbUser.totalPoints += 1
    dbUser.lastActive = new Date()

    // Update streak logic
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    twoDaysAgo.setHours(0, 0, 0, 0)

    // Check if user had attendance yesterday or today already
    const recentAttendance = await Attendance.findOne({
      user: dbUser._id,
      date: { $gte: yesterday },
    }).sort({ date: -1 })

    if (recentAttendance) {
      // User already has attendance for today or yesterday, increment streak
      dbUser.currentStreak += 1
    } else {
      // Check if user had attendance two days ago
      const olderAttendance = await Attendance.findOne({
        user: dbUser._id,
        date: { $gte: twoDaysAgo, $lt: yesterday },
      })

      if (!olderAttendance) {
        // No recent attendance, reset streak
        dbUser.currentStreak = 1
      }
    }

    await dbUser.save()

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/profile")

    // Serialize the Mongoose object
    const serializedAttendance = serializeMongooseObject(newAttendance)

    return NextResponse.json(
      {
        success: true,
        message: "Attendance recorded successfully",
        attendance: serializedAttendance,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating attendance record:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 },
    )
  }
}

