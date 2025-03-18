import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Find the friendship request
    const friendship = await Friendship.findById(params.id)
    if (!friendship) {
      return NextResponse.json({ success: false, message: "Friend request not found" }, { status: 404 })
    }

    // Check if the user is the recipient of the request
    if (friendship.friend.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to accept this request" },
        { status: 403 },
      )
    }

    // Update the friendship status
    friendship.status = "accepted"
    await friendship.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error accepting friend request:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to accept friend request" },
      { status: 500 },
    )
  }
}

