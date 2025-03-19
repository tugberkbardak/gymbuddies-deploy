import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: Request, { params }: { params: { username: string } }) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the user by username
    const user = await User.findOne({ username: params.username })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Return the user data
    return NextResponse.json({
      success: true,
      user: serializeMongooseObject(user),
    })
  } catch (error) {
    console.error("Error finding user by username:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

