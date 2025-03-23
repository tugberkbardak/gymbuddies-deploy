import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"
// Import the streak calculator utility
import { calculateStreak } from "@/utils/streak-calculator"

export async function POST(req: NextRequest) {
  try {
    // Use currentUser instead of auth() for more reliable authentication
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
    const isPublic = formData.get("isPublic") === "true"

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
      // Create user if not found
      const newUser = new User({
        clerkId: user.id,
        username: user.username || `user_${Date.now()}`,
        email: user.emailAddresses[0]?.emailAddress || `user_${Date.now()}@example.com`,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImage: user.imageUrl || "",
        joinedDate: new Date(),
        lastActive: new Date(),
      })

      await newUser.save()
      console.log("Created new user in database:", newUser._id)

      // Use the newly created user
      const dbUser = newUser

      // Create new attendance record
      const newAttendance = new Attendance({
        user: dbUser._id,
        date: new Date(),
        gymName,
        location: locationName,
        coordinates,
        notes,
        image: imageData,
        isPublic,
        points: 1, // Default to 1 point if not specified
      })

      await newAttendance.save()

      // Update user stats
      dbUser.totalAttendance = 1
      dbUser.totalPoints = 1
      dbUser.currentStreak = 0 // Initialize streak at 0
      dbUser.lastActive = new Date()
      await dbUser.save()

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
      isPublic,
      points: 1, // Default to 1 point if not specified
    })

    await newAttendance.save()

    // Update user stats
    dbUser.totalAttendance = (dbUser.totalAttendance || 0) + 1
    dbUser.totalPoints = (dbUser.totalPoints || 0) + 1
    dbUser.lastActive = new Date()

    // NEW STREAK LOGIC: Count a streak as going to the gym at least 3 times in a week
    const today = new Date()
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
    const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 })

    // Count attendances for the current week
    const currentWeekAttendances = await Attendance.countDocuments({
      user: dbUser._id,
      date: { $gte: currentWeekStart, $lte: currentWeekEnd },
    })

    // Check if the user has at least 3 attendances this week
    const hasThreeAttendancesThisWeek = currentWeekAttendances >= 3

    // Check if the user had a streak last week
    const lastWeekStart = subWeeks(currentWeekStart, 1)
    const lastWeekEnd = subWeeks(currentWeekEnd, 1)

    const lastWeekAttendances = await Attendance.countDocuments({
      user: dbUser._id,
      date: { $gte: lastWeekStart, $lte: lastWeekEnd },
    })

    const hadStreakLastWeek = lastWeekAttendances >= 3

    // Update the streak using the utility function
    dbUser.currentStreak = calculateStreak(currentWeekAttendances, hadStreakLastWeek, dbUser.currentStreak || 0)

    await dbUser.save()

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

// Add a GET endpoint to fetch attendance records
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ attendances: [] })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get attendance records for the user
    const attendanceRecords = await Attendance.find({ user: dbUser._id }).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await Attendance.countDocuments({ user: dbUser._id })

    // Serialize the Mongoose objects
    const serializedAttendance = serializeMongooseObject(attendanceRecords)

    return NextResponse.json({
      attendances: serializedAttendance,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error getting user attendance:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

