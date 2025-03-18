import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const userIdParam = searchParams.get("userId")
    const global = searchParams.get("global") === "true"

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let query = {}

    // If global is true, get all attendance records
    // Otherwise, filter by the specified user or the current user
    if (!global) {
      if (userIdParam) {
        const targetUser = await User.findOne({ clerkId: userIdParam })
        if (targetUser) {
          query = { user: targetUser._id }
        } else {
          return NextResponse.json({ error: "Target user not found" }, { status: 404 })
        }
      } else {
        query = { user: dbUser._id }
      }
    }

    const attendances = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username firstName lastName profileImage")

    const total = await Attendance.countDocuments(query)

    // Serialize the Mongoose objects
    const serializedAttendances = serializeMongooseObject(attendances)

    return NextResponse.json({
      attendances: serializedAttendances,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching attendance records:", error)
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

    // Create new attendance record
    const newAttendance = new Attendance({
      user: dbUser._id,
      gymName: body.gymName,
      location: body.location,
      coordinates: body.coordinates,
      notes: body.notes,
      image: body.image,
      points: body.points || 1, // Default to 1 point if not specified
    })

    await newAttendance.save()

    // Update user stats
    await User.findByIdAndUpdate(dbUser._id, {
      $inc: { totalAttendance: 1, totalPoints: newAttendance.points },
      lastActive: new Date(),
    })

    // Serialize the Mongoose object
    const serializedAttendance = serializeMongooseObject(newAttendance)

    return NextResponse.json(serializedAttendance, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance record:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

