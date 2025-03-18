import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
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

    // Build search query
    const searchQuery = query
      ? {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
          ],
        }
      : {}

    const users = await User.find(searchQuery).limit(20)

    // Serialize the Mongoose objects
    const serializedUsers = serializeMongooseObject(users)

    return NextResponse.json(serializedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: clerkUser.id })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = new User({
      clerkId: clerkUser.id,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      profileImage: body.profileImage,
    })

    await newUser.save()

    // Serialize the Mongoose object
    const serializedUser = serializeMongooseObject(newUser)

    return NextResponse.json(serializedUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

