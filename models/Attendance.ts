import mongoose, { Schema, type Document } from "mongoose"
import type { IUser } from "./User"

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId | IUser
  date: Date
  gymName: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  points: number
  notes?: string
  image?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    gymName: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    points: { type: Number, default: 1 },
    notes: { type: String },
    image: { type: String },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema)

