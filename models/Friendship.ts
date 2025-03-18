import mongoose, { Schema, type Document } from "mongoose"
import type { IUser } from "./User"

export interface IFriendship extends Document {
  user: mongoose.Types.ObjectId | IUser
  friend: mongoose.Types.ObjectId | IUser
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

// Make sure the model is properly defined with references
const FriendshipSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    friend: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
)

// Remove the unique index as it might be causing issues
// We'll handle duplicate checks in our code instead
// FriendshipSchema.index({ user: 1, friend: 1 }, { unique: true })

// Check if the model exists before creating it to avoid the
// "Cannot overwrite model once compiled" error in development
export default mongoose.models.Friendship || mongoose.model<IFriendship>("Friendship", FriendshipSchema)

