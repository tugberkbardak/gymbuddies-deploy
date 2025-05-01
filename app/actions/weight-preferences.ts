"use server"

import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function updateWeightPreferences(formData: FormData) {
  try {
    const user = await currentUser()
    if (!user) {
      return { error: "Not authenticated" }
    }

    const unit = formData.get("unit") as "kg" | "lbs"
    const goalWeight = formData.get("goalWeight") ? Number(formData.get("goalWeight")) : undefined
    const goalDate = formData.get("goalDate") ? new Date(formData.get("goalDate") as string) : undefined

    if (goalWeight !== undefined && isNaN(goalWeight)) {
      return { error: "Please enter a valid goal weight" }
    }

    await dbConnect()
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return { error: "User not found" }
    }

    // Update weight preferences
    dbUser.weightPreferences = {
      unit: unit || "kg",
      goalWeight,
      goalDate,
    }

    await dbUser.save()

    revalidatePath("/profile")
    revalidatePath("/profile/weight")

    return { success: true }
  } catch (error) {
    console.error("Error updating weight preferences:", error)
    return { error: "Failed to update weight preferences" }
  }
}

export async function getWeightPreferences() {
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

    return {
      success: true,
      preferences: dbUser.weightPreferences || { unit: "kg" },
    }
  } catch (error) {
    console.error("Error fetching weight preferences:", error)
    return { error: "Failed to fetch weight preferences" }
  }
}
