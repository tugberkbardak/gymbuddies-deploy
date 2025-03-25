import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the user in MongoDB
    const dbUser = await User.findOne({ clerkId: user.id })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Reset the streak
    dbUser.currentStreak = 0
    await dbUser.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting streak:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

