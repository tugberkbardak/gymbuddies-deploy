import { User } from "@/models/User"

/**
 * Ensures a user exists in MongoDB based on Clerk user data
 * @param clerkUser The Clerk user object
 * @returns The MongoDB user document
 */
export async function ensureUserExists(clerkUser) {
  if (!clerkUser || !clerkUser.id) {
    throw new Error("Invalid Clerk user data")
  }

  // Check for required fields
  if (!clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
    throw new Error("Email address is required")
  }

  const email = clerkUser.emailAddresses[0].emailAddress
  if (!email) {
    throw new Error("Invalid email address")
  }

  // Generate a username if not available
  const username = clerkUser.username || email.split("@")[0]
  if (!username) {
    throw new Error("Could not determine username")
  }

  // Find the user in MongoDB
  let user = await User.findOne({ clerkId: clerkUser.id })

  // If user doesn't exist, create them
  if (!user) {
    user = new User({
      clerkId: clerkUser.id,
      username: username,
      email: email,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      profileImage: clerkUser.imageUrl || "",
      joinedDate: new Date(),
      lastActive: new Date(),
    })

    await user.save()
  }

  return user
}

