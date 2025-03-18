import { currentUser } from "@clerk/nextjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Friendship from "@/models/Friendship"

// Update the sendFriendRequest function to properly handle required fields
export async function sendFriendRequest(friendClerkId: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the current user in MongoDB
    const currentUserDoc = await User.findOne({ clerkId: clerkUser.id })

    if (!currentUserDoc) {
      throw new Error("Your user profile is not set up properly. Please log out and log back in.")
    }

    // Find the friend user in MongoDB
    const friendUser = await User.findOne({ clerkId: friendClerkId })

    if (!friendUser) {
      throw new Error("Friend user not found. They need to sign in at least once before you can add them.")
    }

    // Check if a friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user: currentUserDoc._id, friend: friendUser._id },
        { user: friendUser._id, friend: currentUserDoc._id },
      ],
    })

    if (existingFriendship) {
      throw new Error("Friendship request already exists")
    }

    // Create new friendship request
    const newFriendship = new Friendship({
      user: currentUserDoc._id,
      friend: friendUser._id,
      status: "pending",
    })

    await newFriendship.save()

    return { success: true }
  } catch (error) {
    console.error("Error sending friend request:", error)
    return { success: false, message: error.message || "Failed to send friend request" }
  }
}

// Update the searchUsers function to properly handle required fields
export async function searchUsers(query: string) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the current user in MongoDB
    let currentUserDoc = await User.findOne({ clerkId: clerkUser.id })

    // If current user doesn't exist in MongoDB, create them with required fields
    if (!currentUserDoc) {
      // Get email from Clerk user
      const email =
        clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
          ? clerkUser.emailAddresses[0].emailAddress
          : null

      if (!email) {
        throw new Error("Email address is required")
      }

      // Generate a username if not available
      const username = clerkUser.username || email.split("@")[0]
      if (!username) {
        throw new Error("Username is required")
      }

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
      await currentUserDoc.save()
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

    // Get existing friendships
    const friendships = await Friendship.find({
      $or: [{ user: currentUserDoc._id }, { friend: currentUserDoc._id }],
    })

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

    return usersWithStatus
  } catch (error) {
    console.error("Error searching users:", error)
    throw error
  }
}

// Get friend requests
export async function getFriendRequests() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      return []
    }

    // Find pending friend requests where the user is the recipient
    const requests = await Friendship.find({
      friend: user._id,
      status: "pending",
    }).populate("user", "username firstName lastName profileImage")

    return requests
  } catch (error) {
    console.error("Error getting friend requests:", error)
    return []
  }
}

// Get outgoing friend requests
export async function getOutgoingFriendRequests() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      return []
    }

    // Find pending friend requests where the user is the sender
    const requests = await Friendship.find({
      user: user._id,
      status: "pending",
    }).populate("friend", "username firstName lastName profileImage")

    return requests
  } catch (error) {
    console.error("Error getting outgoing friend requests:", error)
    return []
  }
}

// Get friends
export async function getFriends() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("Unauthorized")
    }

    await dbConnect()

    // Find the user in MongoDB
    const user = await User.findOne({ clerkId: clerkUser.id })
    if (!user) {
      return []
    }

    // Find accepted friendships where the user is either the sender or recipient
    const friendships = await Friendship.find({
      $or: [
        { user: user._id, status: "accepted" },
        { friend: user._id, status: "accepted" },
      ],
    })
      .populate("user", "username firstName lastName profileImage currentStreak lastActive")
      .populate("friend", "username firstName lastName profileImage currentStreak lastActive")

    // Transform the data to return a consistent format
    const friends = friendships.map((friendship) => {
      const isFriend = friendship.friend._id.toString() === user._id.toString()
      return {
        friendship,
        friend: isFriend ? friendship.user : friendship.friend,
      }
    })

    return friends
  } catch (error) {
    console.error("Error getting friends:", error)
    return []
  }
}

// Accept friend request
export async function acceptFriendRequest(requestId: string) {
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

    // Find the friendship request
    const friendship = await Friendship.findById(requestId)
    if (!friendship) {
      throw new Error("Friend request not found")
    }

    // Check if the user is the recipient of the request
    if (friendship.friend.toString() !== user._id.toString()) {
      throw new Error("You are not authorized to accept this request")
    }

    // Update the friendship status
    friendship.status = "accepted"
    await friendship.save()

    return { success: true }
  } catch (error) {
    console.error("Error accepting friend request:", error)
    return { success: false, message: error.message || "Failed to accept friend request" }
  }
}

// Reject friend request
export async function rejectFriendRequest(requestId: string) {
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

    // Find the friendship request
    const friendship = await Friendship.findById(requestId)
    if (!friendship) {
      throw new Error("Friend request not found")
    }

    // Check if the user is the recipient of the request
    if (friendship.friend.toString() !== user._id.toString()) {
      throw new Error("You are not authorized to reject this request")
    }

    // Update the friendship status
    friendship.status = "rejected"
    await friendship.save()

    return { success: true }
  } catch (error) {
    console.error("Error rejecting friend request:", error)
    return { success: false, message: error.message || "Failed to reject friend request" }
  }
}

