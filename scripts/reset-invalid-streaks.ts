// This is a script you can run manually to fix streaks
// Run with: npx ts-node scripts/reset-invalid-streaks.ts

import mongoose from "mongoose"
import { config } from "dotenv"
import User from "../models/User"
import Attendance from "../models/Attendance"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"

// Load environment variables
config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable")
  process.exit(1)
}

async function resetInvalidStreaks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Get all users with streaks > 0
    const usersWithStreaks = await User.find({ currentStreak: { $gt: 0 } })
    console.log(`Found ${usersWithStreaks.length} users with streaks > 0`)

    const today = new Date()
    let updatedCount = 0

    for (const user of usersWithStreaks) {
      // Get total attendance count
      const totalAttendance = await Attendance.countDocuments({ user: user._id })

      // If total attendance is less than 3 * streak, the streak is invalid
      if (totalAttendance < user.currentStreak * 3) {
        console.log(
          `User ${user.username} has invalid streak: ${user.currentStreak} with only ${totalAttendance} total attendances`,
        )

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

        console.log(`Updated ${user.username}'s streak to ${consecutiveWeeks}`)
      }
    }

    console.log(`Updated ${updatedCount} users with invalid streaks`)
  } catch (error) {
    console.error("Error resetting invalid streaks:", error)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

resetInvalidStreaks()

