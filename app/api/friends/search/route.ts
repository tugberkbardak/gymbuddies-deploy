import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: Request) {
  console.log("==== API FRIENDS SEARCH STARTED ====")

  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      console.log("Error: No current user found in Clerk")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    console.log("Connected to MongoDB")

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query") || ""
    console.log("Search query:", query)

    // Find the current user in MongoDB
    let currentUserDoc = await User.findOne({ clerkId: clerkUser.id })
    console.log("Current user found:", currentUserDoc ? "Yes" : "No")

    // If current user doesn't exist in MongoDB, create them with required fields
    if (!currentUserDoc) {
      console.log("Creating current user")

      // Get email from Clerk user
      const email =
        clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
          ? clerkUser.emailAddresses[0].emailAddress
          : `user_${Date.now()}@example.com`

      // Generate a username if not available
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
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }
    }

    // Build search query
    const searchQuery = query
      ? {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
          ],
          // Exclude current user from results
          clerkId: { $ne: clerkUser.id },
        }
      : { clerkId: { $ne: clerkUser.id } }

    // Find users matching the query
    const users = await User.find(searchQuery).limit(10)
    console.log(`Found ${users.length} users matching query`)

    // Get existing friendships
    const friendships = await Friendship.find({
      $or: [{ user: currentUserDoc._id }, { friend: currentUserDoc._id }],
    })
    console.log(`Found ${friendships.length} existing friendships`)

    // Add friendship status to each user
    const usersWithStatus = users.map((user) => {
      const friendship = friendships.find(
        (f) =>
          (f.user.toString() === user._id.toString() && f.friend.toString() === currentUserDoc._id.toString()) ||
          (f.user.toString() === currentUserDoc._id.toString() && f.friend.toString() === user._id.toString()),
      )

      return {
        ...user.toObject(),
        friendshipStatus: friendship ? friendship.status : null,
        friendshipId: friendship ? friendship._id : null,
      }
    })

    // Serialize the Mongoose objects
    const serializedUsers = serializeMongooseObject(usersWithStatus)
    console.log("Returning search results")

    return NextResponse.json(serializedUsers)
  } catch (error) {
    console.error("==== API FRIENDS SEARCH ERROR ====")
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
  }
}

