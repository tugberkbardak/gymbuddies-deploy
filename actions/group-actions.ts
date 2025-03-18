"use server"

import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Group from "@/models/Group"
import { revalidatePath } from "next/cache"
import { serializeMongooseObject } from "@/lib/utils-server"

// Create a new group
export async function createGroup(formData: FormData) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      throw new Error("User not found")
    }

    // Extract data from form
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Validate required fields
    if (!name || !description) {
      throw new Error("Name and description are required")
    }

    // Create new group
    const newGroup = new Group({
      name,
      description,
      members: [user._id],
      createdBy: user._id,
    })

    await newGroup.save()

    // Revalidate the groups page
    revalidatePath("/dashboard")

    return { success: true, groupId: newGroup._id }
  } catch (error) {
    console.error("Error creating group:", error)
    return { success: false, message: error.message || "Failed to create group" }
  }
}

// Get user's groups
export async function getUserGroups() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      throw new Error("User not found")
    }

    // Get groups where the user is a member
    const groups = await Group.find({ members: user._id }).populate(
      "createdBy",
      "username firstName lastName profileImage",
    )

    return serializeMongooseObject(groups)
  } catch (error) {
    console.error("Error getting user groups:", error)
    throw error
  }
}

// Get group details
export async function getGroupDetails(groupId: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      throw new Error("User not found")
    }

    // Get the group
    const group = await Group.findById(groupId)
      .populate("members", "username firstName lastName profileImage")
      .populate("createdBy", "username firstName lastName profileImage")

    if (!group) {
      throw new Error("Group not found")
    }

    // Check if the user is a member of the group
    const isMember = group.members.some((member: any) => member._id.toString() === user._id.toString())

    if (!isMember) {
      throw new Error("You are not a member of this group")
    }

    return serializeMongooseObject(group)
  } catch (error) {
    console.error("Error getting group details:", error)
    throw error
  }
}

// Add a user to a group
export async function addUserToGroup(groupId: string, userIdToAdd: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the current user in MongoDB
    const currentUser = await User.findOne({ clerkId: clerkUser.id })
    if (!currentUser) {
      throw new Error("User not found")
    }

    // Find the group
    const group = await Group.findById(groupId)
    if (!group) {
      throw new Error("Group not found")
    }

    // Check if the current user is the creator of the group
    if (group.createdBy.toString() !== currentUser._id.toString()) {
      throw new Error("Only the group creator can add members")
    }

    // Find the user to add
    const userToAdd = await User.findOne({ clerkId: userIdToAdd })
    if (!userToAdd) {
      throw new Error("User to add not found")
    }

    // Check if the user is already a member
    if (group.members.includes(userToAdd._id)) {
      throw new Error("User is already a member of this group")
    }

    // Add the user to the group
    group.members.push(userToAdd._id)
    await group.save()

    // Revalidate the group page
    revalidatePath(`/dashboard/groups/${groupId}`)

    return { success: true }
  } catch (error) {
    console.error("Error adding user to group:", error)
    return { success: false, message: error.message || "Failed to add user to group" }
  }
}

// Remove a user from a group
export async function removeUserFromGroup(groupId: string, userIdToRemove: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the current user in MongoDB
    const currentUserDoc = await User.findOne({ clerkId: clerkUser.id })
    if (!currentUserDoc) {
      throw new Error("User not found")
    }

    // Find the group
    const group = await Group.findById(groupId)
    if (!group) {
      throw new Error("Group not found")
    }

    // Find the user to remove
    const userToRemove = await User.findOne({ clerkId: userIdToRemove })
    if (!userToRemove) {
      throw new Error("User to remove not found")
    }

    // Check if the current user is the creator or the user is removing themselves
    const isCreator = group.createdBy.toString() === currentUserDoc._id.toString()
    const isSelfRemoval = userToRemove._id.toString() === currentUserDoc._id.toString()

    if (!isCreator && !isSelfRemoval) {
      throw new Error("Only the group creator can remove members")
    }

    // Cannot remove the creator
    if (userToRemove._id.toString() === group.createdBy.toString() && !isSelfRemoval) {
      throw new Error("Cannot remove the group creator")
    }

    // Remove the user from the group
    group.members = group.members.filter((memberId) => memberId.toString() !== userToRemove._id.toString())

    // If the group has no members left, delete it
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId)
      revalidatePath("/dashboard")
      return { success: true, deleted: true }
    }

    // If the creator is leaving, assign a new creator
    if (isSelfRemoval && isCreator) {
      group.createdBy = group.members[0]
    }

    await group.save()

    // Revalidate the group page
    revalidatePath(`/dashboard/groups/${groupId}`)

    return { success: true }
  } catch (error) {
    console.error("Error removing user from group:", error)
    return { success: false, message: error.message || "Failed to remove user from group" }
  }
}

