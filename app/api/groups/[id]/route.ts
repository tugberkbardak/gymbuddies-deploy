import { type NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import dbConnect from "@/lib/mongodb"
import Group from "@/models/Group"
import User from "@/models/User"
import Attendance from "@/models/Attendance"
import { serializeMongooseObject } from "@/lib/utils-server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the group exists and the user is a member
    const group = await Group.findById(params.id)
      .populate("members", "username firstName lastName profileImage")
      .populate("createdBy", "username firstName lastName profileImage")

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if the user is a member of the group
    const isMember = group.members.some((member: any) => member._id.toString() === dbUser._id.toString())

    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get group stats
    const memberIds = group.members.map((member: any) => member._id)

    // Get attendance stats for the group
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [weeklyAttendance, monthlyAttendance, memberStats] = await Promise.all([
      Attendance.countDocuments({
        user: { $in: memberIds },
        date: { $gte: weekStart },
      }),
      Attendance.countDocuments({
        user: { $in: memberIds },
        date: { $gte: monthStart },
      }),
      Attendance.aggregate([
        {
          $match: {
            user: { $in: memberIds },
          },
        },
        {
          $group: {
            _id: "$user",
            totalPoints: { $sum: "$points" },
            attendanceCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $project: {
            _id: 1,
            totalPoints: 1,
            attendanceCount: 1,
            username: "$userDetails.username",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            profileImage: "$userDetails.profileImage",
          },
        },
        {
          $sort: { totalPoints: -1 },
        },
      ]),
    ])

    // Calculate average points per member
    const totalPoints = memberStats.reduce((sum, member) => sum + member.totalPoints, 0)
    const averagePointsPerMember =
      memberStats.length > 0 ? Number.parseFloat((totalPoints / memberStats.length).toFixed(1)) : 0

    // Get user's rank in the group
    const userRank = memberStats.findIndex((member) => member._id.toString() === dbUser._id.toString()) + 1

    // Get user's points in the group
    const userPoints = memberStats.find((member) => member._id.toString() === dbUser._id.toString())?.totalPoints || 0

    // Serialize the Mongoose objects
    const serializedGroup = serializeMongooseObject(group)
    const serializedMemberStats = serializeMongooseObject(memberStats)

    return NextResponse.json({
      group: serializedGroup,
      stats: {
        weeklyAttendance,
        monthlyAttendance,
        averagePointsPerMember,
        totalPoints,
        userRank,
        userPoints,
      },
      memberStats: serializedMemberStats,
    })
  } catch (error) {
    console.error("Error fetching group details:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the group exists
    const group = await Group.findById(params.id)

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if the user is the creator of the group
    if (group.createdBy.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Only the group creator can update the group" }, { status: 403 })
    }

    // Update the group
    const updatedGroup = await Group.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true })

    // Serialize the Mongoose object
    const serializedGroup = serializeMongooseObject(updatedGroup)

    return NextResponse.json(serializedGroup)
  } catch (error) {
    console.error("Error updating group:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find the MongoDB user ID from the Clerk ID
    const dbUser = await User.findOne({ clerkId: user.id })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the group exists
    const group = await Group.findById(params.id)

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Check if the user is the creator of the group
    if (group.createdBy.toString() !== dbUser._id.toString()) {
      return NextResponse.json({ error: "Only the group creator can delete the group" }, { status: 403 })
    }

    // Delete the group
    await Group.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Group deleted successfully" })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

