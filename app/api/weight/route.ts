import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import WeightEntry from "@/models/WeightEntry"

// Get all weight entries for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all weight entries for the user, sorted by date
    const weightEntries = await WeightEntry.find({ user: dbUser._id }).sort({ date: 1 })

    return NextResponse.json(weightEntries)
  } catch (error) {
    console.error("Error fetching weight entries:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// Create a new weight entry
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { weight, date, notes } = body

    if (!weight || typeof weight !== "number") {
      return NextResponse.json({ error: "Weight is required and must be a number" }, { status: 400 })
    }

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create new weight entry
    const newWeightEntry = new WeightEntry({
      user: dbUser._id,
      weight,
      date: date ? new Date(date) : new Date(),
      notes,
    })

    await newWeightEntry.save()

    return NextResponse.json(newWeightEntry)
  } catch (error) {
    console.error("Error creating weight entry:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
