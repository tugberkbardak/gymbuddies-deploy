"use server"

import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Attendance from "@/models/Attendance"
import { revalidatePath } from "next/cache"
import { serializeMongooseObject } from "@/lib/utils-server"

// Record new attendance
export async function recordAttendance(formData: FormData) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      throw new Error("User not found")
    }

    // Extract data from form
    const gymName = formData.get("gymName") as string
    const location = formData.get("location") as string
    const lat = Number.parseFloat(formData.get("lat") as string)
    const lng = Number.parseFloat(formData.get("lng") as string)
    const notes = formData.get("notes") as string
    const image = formData.get("image") as string // This would be a base64 string or URL

    // Validate required fields
    if (!gymName || !location || isNaN(lat) || isNaN(lng)) {
      throw new Error("Missing required fields")
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      user: user._id,
      gymName,
      location,
      coordinates: { lat, lng },
      notes,
      image,
      points: 2, // Default points for attendance
      date: new Date(),
    })

    await newAttendance.save()

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: { totalAttendance: 1, totalPoints: 2 },
      lastActive: new Date(),
    })

    // Update streak logic
    await updateUserStreak(user._id)

    // Revalidate the dashboard page to show the new attendance
    revalidatePath("/dashboard")

    return { success: true, message: "Attendance recorded successfully" }
  } catch (error) {
    console.error("Error recording attendance:", error)
    return { success: false, message: error.message || "Failed to record attendance" }
  }
}

// Get user's attendance records
export async function getUserAttendance(page = 1, limit = 10) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      throw new Error("User not found")
    }

    const skip = (page - 1) * limit

    // Get attendance records
    const attendances = await Attendance.find({ user: user._id }).sort({ date: -1 }).skip(skip).limit(limit)

    const total = await Attendance.countDocuments({ user: user._id })

    // Serialize the Mongoose objects
    const serializedAttendances = serializeMongooseObject(attendances)

    return {
      attendances: serializedAttendances,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting user attendance:", error)
    throw error
  }
}

// Get global attendance feed
export async function getGlobalAttendance(page = 1, limit = 10) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    const skip = (page - 1) * limit

    // Get global attendance records
    const attendances = await Attendance.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username firstName lastName profileImage")

    const total = await Attendance.countDocuments()

    // Serialize the Mongoose objects
    const serializedAttendances = serializeMongooseObject(attendances)

    return {
      attendances: serializedAttendances,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting global attendance:", error)
    throw error
  }
}

// Helper function to update user streak
async function updateUserStreak(userId) {
  try {
    // Get the user's most recent attendance before today
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const latestAttendance = await Attendance.findOne({
      user: userId,
      date: { $lt: today },
    }).sort({ date: -1 })

    const user = await User.findById(userId)

    if (!latestAttendance) {
      // First attendance or no previous attendance
      user.currentStreak = 1
    } else {
      const latestDate = new Date(latestAttendance.date)
      latestDate.setHours(0, 0, 0, 0)

      const diffTime = Math.abs(today.getTime() - latestDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day, increment streak
        user.currentStreak += 1
      } else if (diffDays > 1) {
        // Streak broken
        user.currentStreak = 1
      }
      // If diffDays === 0, it means multiple check-ins on the same day, don't change streak
    }

    await user.save()
  } catch (error) {
    console.error("Error updating user streak:", error)
  }
}

