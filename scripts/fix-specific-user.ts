// This is a script you can run manually to fix a specific user's streak
// Run with: npx ts-node scripts/fix-specific-user.ts

import mongoose from "mongoose"
import { config } from "dotenv"
import User from "../models/User"
import Attendance from "../models/Attendance"

// Load environment variables
config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable")
  process.exit(1)
}

async function fixSpecificUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Find the user by username
    const user = await User.findOne({ username: "erim700" })

    if (!user) {
      console.log("User not found")
      return
    }

    console.log(`Found user: ${user.username} with streak: ${user.currentStreak}`)

    // Get total attendance count
    const totalAttendance = await Attendance.countDocuments({ user: user._id })
    console.log(`Total attendance: ${totalAttendance}`)

    // Reset streak to 0 if total attendance is less than 3
    if (totalAttendance < 3) {
      user.currentStreak = 0
      await user.save()
      console.log(`Reset ${user.username}'s streak to 0`)
    }
  } catch (error) {
    console.error("Error fixing specific user:", error)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

fixSpecificUser()

