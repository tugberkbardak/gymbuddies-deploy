import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET() {
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

    // Return the user data
    return NextResponse.json(serializeMongooseObject(dbUser))
  } catch (error) {
    console.error("Error getting user profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

