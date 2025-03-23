import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the attendance record
    const attendance = await Attendance.findById(params.id)

    if (!attendance) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    // Check if the user owns this attendance record
    if (attendance.user.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "You don't have permission to update this record" }, { status: 403 })
    }

    // Get the new visibility state from the request body
    const body = await req.json()
    const { isPublic } = body

    if (typeof isPublic !== "boolean") {
      return NextResponse.json({ error: "Invalid visibility value" }, { status: 400 })
    }

    // Update the attendance record
    attendance.isPublic = isPublic
    await attendance.save()

    // Log the update for debugging
    console.log(`Updated attendance ${params.id} visibility to ${isPublic ? "public" : "private"}`)

    // Return the updated record
    return NextResponse.json({
      success: true,
      attendance: serializeMongooseObject(attendance),
    })
  } catch (error) {
    console.error("Error updating attendance visibility:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

