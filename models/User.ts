import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  clerkId: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  profileImage?: string
  bio?: string
  currentStreak: number
  totalPoints: number
  totalAttendance: number
  joinedDate: Date
  lastActive: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    currentStreak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    totalAttendance: { type: Number, default: 0 },
    joinedDate: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

