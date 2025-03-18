import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Friendship from "@/models/Friendship"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the friendship
    const friendship = await Friendship.findById(params.id)

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 })
    }

    // Check if the user is the recipient of the friendship request
    if (friendship.friend.toString() !== dbUser._id.toString()) {
      return NextResponse.json(
        { error: "Only the recipient can accept or reject the friendship request" },
        { status: 403 },
      )
    }

    // Update the friendship status
    friendship.status = body.status
    await friendship.save()

    // Serialize the Mongoose object
    const serializedFriendship = serializeMongooseObject(friendship)

    return NextResponse.json(serializedFriendship)
  } catch (error) {
    console.error("Error updating friendship:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Find the friendship
    const friendship = await Friendship.findById(params.id)

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 })
    }

    // Check if the user is part of the friendship
    if (
      friendship.user.toString() !== dbUser._id.toString() &&
      friendship.friend.toString() !== dbUser._id.toString()
    ) {
      return NextResponse.json({ error: "Only users in the friendship can delete it" }, { status: 403 })
    }

    // Delete the friendship
    await Friendship.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Friendship deleted successfully" })
  } catch (error) {
    console.error("Error deleting friendship:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

