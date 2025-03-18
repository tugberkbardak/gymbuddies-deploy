import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ clerkId: params.id })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Serialize the Mongoose object
    const serializedUser = serializeMongooseObject(user)

    return NextResponse.json(serializedUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser || clerkUser.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()

    const user = await User.findOneAndUpdate({ clerkId: params.id }, { $set: body }, { new: true, runValidators: true })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Serialize the Mongoose object
    const serializedUser = serializeMongooseObject(user)

    return NextResponse.json(serializedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

