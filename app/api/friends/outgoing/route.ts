import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      // Return empty array instead of error if user not found
      return NextResponse.json([])
    }

    // Find pending friend requests where the user is the sender
    const requests = await Friendship.find({
      user: user._id,
      status: "pending",
    }).populate("friend", "username firstName lastName profileImage")

    // Serialize the Mongoose objects
    const serializedRequests = serializeMongooseObject(requests)

    return NextResponse.json(serializedRequests)
  } catch (error) {
    console.error("Error getting outgoing friend requests:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

