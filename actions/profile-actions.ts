"use server"

import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { revalidatePath } from "next/cache"

// Update user profile in MongoDB
export async function updateUserProfile(formData: FormData) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const dbUser = await User.findOne({ clerkId: user.id })
    if (!dbUser) {
      throw new Error("User not found")
    }

    // Extract form data
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const bio = formData.get("bio") as string
    const defaultGym = formData.get("defaultGym") as string

    // Update user in MongoDB
    dbUser.firstName = firstName || ""
    dbUser.lastName = lastName || ""
    dbUser.bio = bio || ""
    dbUser.defaultGym = defaultGym || ""
    dbUser.lastActive = new Date()

    await dbUser.save()

    // Log the updated user
    console.log("Updated user in MongoDB:", {
      id: dbUser._id,
      clerkId: dbUser.clerkId,
      bio: dbUser.bio,
      defaultGym: dbUser.defaultGym,
    })

    // Revalidate paths
    revalidatePath("/profile")
    revalidatePath(`/profile/${user.id}`)
    revalidatePath(`/profile/username/${dbUser.username}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error: error.message || "Failed to update profile" }
  }
}

