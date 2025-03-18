"use server"

import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { serializeMongooseObject } from "@/lib/utils-server"

// Create or update user in MongoDB when they sign up or update their profile in Clerk
export async function syncUserWithDatabase() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ clerkId: clerkUser.id })

    if (existingUser) {
      // Update existing user
      existingUser.username = clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split("@")[0]
      existingUser.firstName = clerkUser.firstName || ""
      existingUser.lastName = clerkUser.lastName || ""
      existingUser.email = clerkUser.emailAddresses[0].emailAddress
      existingUser.profileImage = clerkUser.imageUrl
      existingUser.lastActive = new Date()

      await existingUser.save()
      return serializeMongooseObject(existingUser)
    } else {
      // Create new user
      const newUser = new User({
        clerkId: clerkUser.id,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split("@")[0],
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        email: clerkUser.emailAddresses[0].emailAddress,
        profileImage: clerkUser.imageUrl,
        joinedDate: new Date(),
        lastActive: new Date(),
      })

      await newUser.save()
      return serializeMongooseObject(newUser)
    }
  } catch (error) {
    console.error("Error syncing user with database:", error)
    throw error
  }
}

// Get user profile data
export async function getUserProfile(userId?: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    const targetUserId = userId || clerkUser.id

    await dbConnect()

    const user = await User.findOne({ clerkId: targetUserId })

    if (!user) {
      throw new Error("User not found")
    }

    return serializeMongooseObject(user)
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user bio
export async function updateUserBio(bio: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    const user = await User.findOne({ clerkId: clerkUser.id })

    if (!user) {
      throw new Error("User not found")
    }

    user.bio = bio
    await user.save()

    return serializeMongooseObject(user)
  } catch (error) {
    console.error("Error updating user bio:", error)
    throw error
  }
}

