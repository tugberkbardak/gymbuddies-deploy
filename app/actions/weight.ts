"use server"

import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import WeightEntry from "@/models/WeightEntry"

export async function addWeightEntry(formData: FormData) {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    const weight = parseFloat(formData.get("weight") as string)
    const notes = formData.get("notes") as string
    const date = formData.get("date") ? new Date(formData.get("date") as string) : new Date()

    if (isNaN(weight) || weight <= 0) {
      return { error: "Please enter a valid weight" }
    }

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return { error: "User not found" }
    }

    // Create new weight entry
    const newWeightEntry = new WeightEntry({
      user: dbUser._id,
      weight,
      date,
      notes,
    })

    await newWeightEntry.save()

    revalidatePath("/profile")
    revalidatePath("/profile/weight")

    return { success: true, entry: newWeightEntry }
  } catch (error) {
    console.error("Error adding weight entry:", error)
    return { error: "Failed to add weight entry" }
  }
}

export async function getWeightEntries() {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return { error: "User not found" }
    }

    // Get all weight entries for the user, sorted by date
    const weightEntries = await WeightEntry.find({ user: dbUser._id }).sort({ date: 1 })

    return { success: true, entries: weightEntries }
  } catch (error) {
    console.error("Error fetching weight entries:", error)
    return { error: "Failed to fetch weight entries" }
  }
}

export async function deleteWeightEntry(id: string) {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return { error: "User not found" }
    }

    // Find the weight entry
    const weightEntry = await WeightEntry.findById(id)

    if (!weightEntry) {
      return { error: "Weight entry not found" }
    }

    // Check if the entry belongs to the user
    if (weightEntry.user.toString() !== dbUser._id.toString()) {
      return { error: "Not authorized to delete this entry" }
    }

    await WeightEntry.findByIdAndDelete(id)

    revalidatePath("/profile")
    revalidatePath("/profile/weight")

    return { success: true, message: "Weight entry deleted successfully" }
  } catch (error) {
    console.error("Error deleting weight entry:", error)
    return { error: "Failed to delete weight entry" }
  }
}
