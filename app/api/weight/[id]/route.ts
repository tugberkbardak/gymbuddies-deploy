import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import WeightEntry from "@/models/WeightEntry"

// Update a weight entry
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = params
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

    // Find the weight entry
    const weightEntry = await WeightEntry.findById(id)

    if (!weightEntry) {
      return NextResponse.json({ error: "Weight entry not found" }, { status: 404 })
    }

    // Check if the entry belongs to the user
    if (weightEntry.user.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Not authorized to update this entry" }, { status: 403 })
    }

    // Update the entry
    weightEntry.weight = weight
    if (date) weightEntry.date = new Date(date)
    if (notes !== undefined) weightEntry.notes = notes

    await weightEntry.save()

    return NextResponse.json(weightEntry)
  } catch (error) {
    console.error("Error updating weight entry:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// Delete a weight entry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the weight entry
    const weightEntry = await WeightEntry.findById(id)

    if (!weightEntry) {
      return NextResponse.json({ error: "Weight entry not found" }, { status: 404 })
    }

    // Check if the entry belongs to the user
    if (weightEntry.user.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Not authorized to delete this entry" }, { status: 403 })
    }

    await WeightEntry.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "Weight entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting weight entry:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
