import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Group from "@/models/Group"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query") || ""

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find groups where the user is a member
    const groups = await Group.find({
      members: dbUser._id,
      ...(query ? { name: { $regex: query, $options: "i" } } : {}),
    }).populate("createdBy", "username firstName lastName profileImage")

    // Serialize the Mongoose objects
    const serializedGroups = serializeMongooseObject(groups)

    return NextResponse.json(serializedGroups)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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

    // Create new group
    const newGroup = new Group({
      name: body.name,
      description: body.description,
      members: [dbUser._id], // Add creator as the first member
      createdBy: dbUser._id,
    })

    await newGroup.save()

    // Serialize the Mongoose object
    const serializedGroup = serializeMongooseObject(newGroup)

    return NextResponse.json(serializedGroup, { status: 201 })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

