import mongoose, { Schema, type Document } from "mongoose"
import type { IUser } from "./User"

export interface IFriendship extends Document {
  user: mongoose.Types.ObjectId | IUser
  friend: mongoose.Types.ObjectId | IUser
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

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

// Ensure that the combination of user and friend is unique
FriendshipSchema.index({ user: 1, friend: 1 }, { unique: true })

export default mongoose.models.Friendship || mongoose.model<IFriendship>("Friendship", FriendshipSchema)

