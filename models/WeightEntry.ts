import mongoose, { Schema, type Document } from "mongoose"

export interface WeightEntryDocument extends Document {
  user: mongoose.Types.ObjectId
  weight: number
  date: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const WeightEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true },
)

// Check if the model already exists to prevent overwriting
const WeightEntry = mongoose.models.WeightEntry || mongoose.model<WeightEntryDocument>("WeightEntry", WeightEntrySchema)

export default WeightEntry
