import { Types } from "mongoose"

// Helper function to serialize Mongoose objects
export function serializeMongooseObject(obj: any): any {
  if (!obj) return null

  // If it's an array, map through and serialize each item
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeMongooseObject(item))
  }

  // If it's a date, convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // If it's a MongoDB ObjectId, convert to string
  if (obj instanceof Types.ObjectId) {
    return obj.toString()
  }

  // If it's a Buffer or Uint8Array, convert to string
  if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
    return obj.toString("hex")
  }

  // If it has a toObject method (Mongoose document), use it
  if (obj.toObject && typeof obj.toObject === "function") {
    const serialized = obj.toObject()

    // Convert any nested Mongoose objects
    Object.keys(serialized).forEach((key) => {
      if (serialized[key] && typeof serialized[key] === "object") {
        serialized[key] = serializeMongooseObject(serialized[key])
      }
    })

    return serialized
  }

  // If it's a plain object, process its properties
  if (obj !== null && typeof obj === "object") {
    const serialized = {}

    Object.keys(obj).forEach((key) => {
      // Handle _id specifically
      if (key === "_id" && obj[key] && typeof obj[key] === "object") {
        if (obj[key].toString && typeof obj[key].toString === "function") {
          serialized[key] = obj[key].toString()
        } else {
          serialized[key] = serializeMongooseObject(obj[key])
        }
      } else {
        serialized[key] = serializeMongooseObject(obj[key])
      }
    })

    return serialized
  }

  // Otherwise return as is
  return obj
}

