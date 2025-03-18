// // This is a script you can run manually to create test users in MongoDB
// // Run with: npx ts-node scripts/create-test-users.ts

// import mongoose from "mongoose"
// import { config } from "dotenv"
// import { User } from "../models/User"

// // Load environment variables
// config()

// const MONGODB_URI = process.env.MONGODB_URI

// if (!MONGODB_URI) {
//   console.error("Please define the MONGODB_URI environment variable")
//   process.exit(1)
// }

// async function createTestUsers() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(MONGODB_URI)
//     console.log("Connected to MongoDB")

//     // Create test users
//     const testUsers = [
//       {
//         clerkId: "test_user_1",
//         username: "testuser1",
//         email: "test1@example.com",
//         firstName: "Test",
//         lastName: "User1",
//         profileImage: "/placeholder.svg?height=40&width=40",
//       },
//       {
//         clerkId: "test_user_2",
//         username: "testuser2",
//         email: "test2@example.com",
//         firstName: "Test",
//         lastName: "User2",
//         profileImage: "/placeholder.svg?height=40&width=40",
//       },
//     ]

//     for (const userData of testUsers) {
//       // Check if user already exists
//       const existingUser = await User.findOne({ clerkId: userData.clerkId })

//       if (existingUser) {
//         console.log(`User ${userData.username} already exists`)
//       } else {
//         const newUser = new User({
//           ...userData,
//           joinedDate: new Date(),
//           lastActive: new Date(),
//         })

//         await newUser.save()
//         console.log(`Created user ${userData.username}`)
//       }
//     }

//     console.log("Test users created successfully")
//   } catch (error) {
//     console.error("Error creating test users:", error)
//   } finally {
//     // Disconnect from MongoDB
//     await mongoose.disconnect()
//     console.log("Disconnected from MongoDB")
//   }
// }

// createTestUsers()

