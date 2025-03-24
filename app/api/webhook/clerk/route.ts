import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers")
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Get the event type
  const eventType = evt.type
  console.log("Webhook event type:", eventType)

  // Connect to MongoDB
  await dbConnect()

  // Handle the event
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, username, email_addresses, first_name, last_name, image_url, user_metadata } = evt.data
    console.log("Webhook user data:", JSON.stringify({ id, username, email_addresses, first_name, last_name }, null, 2))

    try {
      // Validate required fields
      if (!id) {
        console.error("Missing Clerk user ID")
        return NextResponse.json({ success: false, error: "Missing Clerk user ID" }, { status: 400 })
      }

      // Make sure we have an email address
      if (!email_addresses || email_addresses.length === 0 || !email_addresses[0].email_address) {
        console.error("No valid email address found for user:", id)
        return NextResponse.json({ success: false, error: "No valid email address found" }, { status: 400 })
      }

      const email = email_addresses[0].email_address

      // Generate a base username from email or name
      const baseUsername = username || email.split("@")[0]
      if (!baseUsername) {
        console.error("Could not determine username for user:", id)
        return NextResponse.json({ success: false, error: "Could not determine username" }, { status: 400 })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: id })

      if (existingUser) {
        console.log("Updating existing user:", existingUser._id)
        // Update existing user
        existingUser.firstName = first_name || ""
        existingUser.lastName = last_name || ""
        existingUser.email = email
        existingUser.profileImage = image_url || ""
        existingUser.lastActive = new Date()

        // Add this line to update the defaultGym
        existingUser.defaultGym = user_metadata?.defaultGym || existingUser.defaultGym || ""

        // Add this line to update the bio
        existingUser.bio = user_metadata?.bio || existingUser.bio || ""

        // Only update username if it's provided and different
        if (username && username !== existingUser.username) {
          // Check if the new username is already taken
          const usernameExists = await User.findOne({
            username,
            clerkId: { $ne: id }, // Exclude current user
          })

          if (!usernameExists) {
            existingUser.username = username
          }
          // If username exists, keep the old one
        }

        await existingUser.save()
        console.log("Updated user in MongoDB:", id)
      } else {
        console.log("Creating new user with data:", {
          clerkId: id,
          username: baseUsername,
          email,
          firstName: first_name || "",
          lastName: last_name || "",
        })

        // For new users, ensure username is unique
        let uniqueUsername = baseUsername
        let counter = 0

        // Check if username already exists and generate a unique one if needed
        while (await User.findOne({ username: uniqueUsername })) {
          counter++
          uniqueUsername = `${baseUsername}${counter}`
        }

        // Create new user with unique username
        const newUser = new User({
          clerkId: id,
          username: uniqueUsername,
          firstName: first_name || "",
          lastName: last_name || "",
          email: email,
          profileImage: image_url || "",
          defaultGym: user_metadata?.defaultGym || "",
          joinedDate: new Date(),
          lastActive: new Date(),
        })

        await newUser.save()
        console.log("Created new user in MongoDB:", id)
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error handling webhook:", error)
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
    }
  }

  // Return a response
  return NextResponse.json({ success: true })
}

