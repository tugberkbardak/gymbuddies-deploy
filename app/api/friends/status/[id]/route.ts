import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the current user in MongoDB
    const currentUserDoc = await User.findOne({ clerkId: clerkUser.id })
    if (!currentUserDoc) {
      return NextResponse.json({ success: false, error: "Current user not found" }, { status: 404 })
    }

    // Find the target user in MongoDB
    const targetUser = await User.findOne({ clerkId: params.id })
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target user not found" }, { status: 404 })
    }

    // Check if users are the same
    if (currentUserDoc._id.toString() === targetUser._id.toString()) {
      return NextResponse.json({
        success: true,
        status: "self",
        message: "This is your own profile",
      })
    }

    // Check if a friendship exists
    const friendship = await Friendship.findOne({
      $or: [
        { user: currentUserDoc._id, friend: targetUser._id },
        { user: targetUser._id, friend: currentUserDoc._id },
      ],
    })

    if (!friendship) {
      return NextResponse.json({
        success: true,
        status: "none",
        message: "No friendship exists",
      })
    }

    // Determine the status from the current user's perspective
    const status = friendship.status
    let direction = "none"

    if (friendship.status === "pending") {
      if (friendship.user.toString() === currentUserDoc._id.toString()) {
        direction = "outgoing"
      } else {
        direction = "incoming"
      }
    }

    return NextResponse.json({
      success: true,
      status: friendship.status,
      direction,
      friendshipId: friendship._id,
      message: `Friendship status: ${friendship.status}`,
    })
  } catch (error) {
    console.error("Error checking friendship status:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

