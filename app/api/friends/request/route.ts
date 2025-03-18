import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import mongoose from "mongoose"

export async function POST(req: Request) {
  console.log("==== API FRIEND REQUEST STARTED ====")

  try {
    // Get current user from Clerk
    const clerkUser = await currentUser()

    if (!clerkUser) {
      console.log("Error: No current user found in Clerk")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", body)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
    }

    const { friendClerkId } = body

    if (!friendClerkId) {
      console.log("Error: No friendClerkId provided")
      return NextResponse.json({ success: false, message: "Friend ID is required" }, { status: 400 })
    }

    console.log("Current Clerk User:", clerkUser.id)
    console.log("Friend Clerk ID:", friendClerkId)

    // Connect to MongoDB
    await dbConnect()

    // Find current user
    let currentUserDoc = await User.findOne({ clerkId: clerkUser.id })
    console.log("Current user found:", currentUserDoc ? "Yes" : "No")

    if (!currentUserDoc) {
      console.log("Creating current user")
      // Create user with required fields
      const email =
        clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
          ? clerkUser.emailAddresses[0].emailAddress
          : `user_${Date.now()}@example.com`

      const username =
        clerkUser.username ||
        (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
          ? clerkUser.emailAddresses[0].emailAddress.split("@")[0]
          : `user_${Date.now()}`)

      currentUserDoc = new User({
        clerkId: clerkUser.id,
        username: username,
        email: email,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        profileImage: clerkUser.imageUrl || "",
        joinedDate: new Date(),
        lastActive: new Date(),
      })

      try {
        await currentUserDoc.save()
        console.log("Created new user:", currentUserDoc._id)
      } catch (saveError) {
        console.error("Error saving new user:", saveError)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to create user profile",
          },
          { status: 500 },
        )
      }
    }

    // Find friend user
    const friendUserDoc = await User.findOne({ clerkId: friendClerkId })
    console.log("Friend user found:", friendUserDoc ? "Yes" : "No")

    if (!friendUserDoc) {
      console.log("Error: Friend user not found")
      return NextResponse.json({
        success: false,
        message: "Friend user not found. They need to sign in at least once before you can add them.",
      })
    }

    // Check for existing friendship - more detailed check
    console.log("Checking for existing friendship between", currentUserDoc._id, "and", friendUserDoc._id)

    const existingFriendship = await Friendship.findOne({
      $or: [
        {
          user: currentUserDoc._id.toString(),
          friend: friendUserDoc._id.toString(),
        },
        {
          user: friendUserDoc._id.toString(),
          friend: currentUserDoc._id.toString(),
        },
      ],
    })

    if (existingFriendship) {
      console.log("Friendship already exists:", existingFriendship._id)
      return NextResponse.json({
        success: false,
        message: "Friendship already exists",
        status: existingFriendship.status,
      })
    }

    // Create new friendship with explicit ObjectId conversion
    const newFriendship = new Friendship({
      user: new mongoose.Types.ObjectId(currentUserDoc._id),
      friend: new mongoose.Types.ObjectId(friendUserDoc._id),
      status: "pending",
    })

    console.log("Attempting to save new friendship with data:", {
      user: newFriendship.user,
      friend: newFriendship.friend,
      status: newFriendship.status,
    })

    try {
      const savedFriendship = await newFriendship.save()
      console.log("New friendship created:", savedFriendship._id)

      return NextResponse.json({
        success: true,
        message: "Friend request sent successfully",
        friendshipId: savedFriendship._id.toString(),
      })
    } catch (saveError) {
      console.error("Error saving new friendship:", saveError)

      // Check for specific MongoDB errors
      if (saveError.name === "ValidationError") {
        console.error("Validation error details:", saveError.errors)
        return NextResponse.json(
          {
            success: false,
            message: "Validation error when creating friendship",
            details: Object.keys(saveError.errors).map((key) => ({
              field: key,
              message: saveError.errors[key].message,
            })),
          },
          { status: 400 },
        )
      }

      if (saveError.code === 11000) {
        // Duplicate key error
        console.error("Duplicate key error details:", saveError.keyValue)
        return NextResponse.json(
          {
            success: false,
            message: "This friendship already exists",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to create friendship",
          error: saveError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("==== API FRIEND REQUEST ERROR ====")
    console.error(error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

