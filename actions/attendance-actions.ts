"use server"

import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Attendance from "@/models/Attendance"
import { serializeMongooseObject } from "@/lib/utils-server"

// Get user's attendance records
export async function getUserAttendance(limit = 10, page = 1) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      throw new Error("User not found")
    }

    const skip = (page - 1) * limit

    // Get attendance records for the user
    const attendanceRecords = await Attendance.find({ user: user._id }).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await Attendance.countDocuments({ user: user._id })

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
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    const skip = (page - 1) * limit

    // Get attendance records for all users
    const attendanceRecords = await Attendance.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username firstName lastName profileImage")

    const total = await Attendance.countDocuments()

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
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Determine which user to get data for
    const targetUserId = userId || clerkUser.id

    // Find the MongoDB user ID from the Clerk ID
    const user = await User.findOne({ clerkId: targetUserId })
    if (!user) {
      throw new Error("User not found")
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

    return heatmapData
  } catch (error) {
    console.error("Error getting user attendance heatmap:", error)
    return []
  }
}

