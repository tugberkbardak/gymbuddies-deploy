"use server"

import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Attendance from "@/models/Attendance"
import { serializeMongooseObject } from "@/lib/utils-server"
import { revalidatePath } from "next/cache"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"

// Get user's attendance records
export async function getUserAttendance(limit = 10, page = 1) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })
    if (!dbUser) {
      return {
        attendances: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      }
    }

    const skip = (page - 1) * limit

    // Get attendance records for the user
    const attendanceRecords = await Attendance.find({ user: dbUser._id }).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await Attendance.countDocuments({ user: dbUser._id })

    // Serialize the Mongoose objects
    const serializedAttendance = serializeMongooseObject(attendanceRecords)

    return {
      attendances: serializedAttendance,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting user attendance:", error)
    return {
      attendances: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    }
  }
}

// Get global attendance records
export async function getGlobalAttendance(limit = 10, page = 1) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    const skip = (page - 1) * limit

    // Get only public attendance records for all users
    const attendanceRecords = await Attendance.find({ isPublic: true })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username firstName lastName profileImage")

    const total = await Attendance.countDocuments({ isPublic: true })

    // Serialize the Mongoose objects
    const serializedAttendance = serializeMongooseObject(attendanceRecords)

    return {
      attendances: serializedAttendance,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting global attendance:", error)
    return {
      attendances: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    }
  }
}

// Get user's attendance heatmap data
export async function getUserAttendanceHeatmap(userId?: string, year?: number) {
  try {
    const currentUserData = await currentUser()
    if (!currentUserData) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Determine which user to get data for
    const targetUserId = userId || currentUserData.id

    // Find the MongoDB user ID from the Clerk ID
    const user = await User.findOne({ clerkId: targetUserId })
    if (!user) {
      return []
    }

    // Set default year to current year if not provided
    const targetYear = year || new Date().getFullYear()

    // Create date range for the year
    const startDate = new Date(targetYear, 0, 1) // January 1st
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59) // December 31st 23:59:59

    // Get attendance records for the year
    const attendanceRecords = await Attendance.find({
      user: user._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    // Process data for heatmap
    const heatmapData = []

    // Group by date
    const dateMap = new Map()

    attendanceRecords.forEach((record) => {
      // Create a date object in the local timezone
      const date = new Date(record.date)
      // Format to YYYY-MM-DD in local timezone
      const dateStr = date.toLocaleDateString("en-CA") // en-CA uses YYYY-MM-DD format

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

    return heatmapData
  } catch (error) {
    console.error("Error getting user attendance heatmap:", error)
    return []
  }
}

// New function to record attendance - make sure it's properly exported
export async function recordAttendance(formData: FormData) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    await dbConnect()

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
    }

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
      return { success: false, error: "Invalid coordinates format" }
    }

    // Validate required fields
    if (!gymName || !locationName) {
      return { success: false, error: "Gym name and location are required" }
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
      points: 1, // Default to 1 point
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

    // Check if the user had a streak last week (3+ attendances)
    const lastWeekStart = subWeeks(currentWeekStart, 1)
    const lastWeekEnd = subWeeks(currentWeekEnd, 1)

    const lastWeekAttendances = await Attendance.countDocuments({
      user: dbUser._id,
      date: { $gte: lastWeekStart, $lte: lastWeekEnd },
    })

    const hadStreakLastWeek = lastWeekAttendances >= 3

    // Apply the stricter streak calculation
    if (hasThreeAttendancesThisWeek) {
      if (hadStreakLastWeek) {
        // If they had a streak last week and qualified this week, increment
        dbUser.currentStreak = (dbUser.currentStreak || 0) + 1
      } else {
        // If they didn't have a streak last week but qualified this week, start at 1
        dbUser.currentStreak = 1
      }
    } else {
      // If they don't have 3+ attendances this week, no streak
      dbUser.currentStreak = 0
    }

    await dbUser.save()

    // Revalidate the dashboard and profile pages
    revalidatePath("/dashboard")
    revalidatePath("/profile")

    return {
      success: true,
      message: "Attendance recorded successfully",
      attendance: serializeMongooseObject(newAttendance),
    }
  } catch (error) {
    console.error("Error recording attendance:", error)
    return {
      success: false,
      error: error.message || "Failed to record attendance",
    }
  }
}

