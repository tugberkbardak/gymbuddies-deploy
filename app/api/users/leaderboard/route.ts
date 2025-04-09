import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    await dbConnect()

    // Find all users with their totalAttendance field and currentStreak
    const users = await User.find()
      .select("username firstName lastName profileImage currentStreak totalAttendance")
      .lean()

    // If totalAttendance doesn't exist on some users, default to 0
    const usersWithAttendance = users.map((user) => ({
      ...user,
      attendanceCount: user.totalAttendance || 0,
      // Ensure profileImageUrl is available for the frontend
      profileImageUrl: user.profileImage || user.profileImageUrl,
    }))

    // Sort by attendance count (highest first)
    const sortedUsers = usersWithAttendance.sort((a, b) => b.attendanceCount - a.attendanceCount)

    // Take top 10 users
    const topUsers = sortedUsers.slice(0, 10)

    return NextResponse.json(topUsers)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
