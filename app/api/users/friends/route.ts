import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the current user in MongoDB
    const currentUserDoc = await User.findOne({ clerkId: user.id })
    if (!currentUserDoc) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Find all accepted friendships
    const friendships = await Friendship.find({
      $or: [
        { user: currentUserDoc._id, status: "accepted" },
        { friend: currentUserDoc._id, status: "accepted" },
      ],
    })
      .populate("user", "username firstName lastName profileImage currentStreak lastActive clerkId")
      .populate("friend", "username firstName lastName profileImage currentStreak lastActive clerkId")

    // Transform the data to return a consistent format
    const friends = friendships.map((friendship) => {
      const isFriend = friendship.friend._id.toString() === currentUserDoc._id.toString()
      return {
        friendship,
        friend: isFriend ? friendship.user : friendship.friend,
      }
    })

    // Serialize the Mongoose objects
    const serializedFriends = serializeMongooseObject(friends)

    return NextResponse.json({
      success: true,
      data: serializedFriends,
    })
  } catch (error) {
    console.error("Error getting user's friends:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

