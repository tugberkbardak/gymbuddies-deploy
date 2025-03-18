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

    // Find accepted friendships where the user is either the sender or recipient
    const friendships = await Friendship.find({
      $or: [
        { user: user._id, status: "accepted" },
        { friend: user._id, status: "accepted" },
      ],
    })
      .populate("user", "username firstName lastName profileImage currentStreak lastActive clerkId")
      .populate("friend", "username firstName lastName profileImage currentStreak lastActive clerkId")

    // Transform the data to return a consistent format
    const friends = friendships.map((friendship) => {
      const isFriend = friendship.friend._id.toString() === user._id.toString()
      return {
        friendship,
        friend: isFriend ? friendship.user : friendship.friend,
      }
    })

    // Serialize the Mongoose objects
    const serializedFriends = serializeMongooseObject(friends)

    return NextResponse.json(serializedFriends)
  } catch (error) {
    console.error("Error getting friends:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

