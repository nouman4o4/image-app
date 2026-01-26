"use server"

import { connectDB } from "@/lib/db"
import { User } from "@/models/user.model"
import { Types } from "mongoose"

export async function toggleFollow({
  currentUserId,
  targetUserId,
}: {
  currentUserId: string
  targetUserId: string
}) {
  if (!currentUserId) throw new Error("Unauthorized")
  if (!targetUserId) throw new Error("Target user missing")

  if (currentUserId === targetUserId) {
    throw new Error("You cannot follow yourself")
  }

  await connectDB()

  const currentUser = await User.findById(currentUserId)
  const targetUser = await User.findById(targetUserId)

  if (!currentUser || !targetUser) {
    throw new Error("User not found")
  }

  const isAlreadyFollowing = currentUser.following?.some(
    (id: any) => id.toString() === targetUserId,
  )

  if (isAlreadyFollowing) {
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    })

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    })

    return { followed: false }
  } else {
    // 🟢 FOLLOW
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: new Types.ObjectId(targetUserId) },
    })

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: new Types.ObjectId(currentUserId) },
    })

    return { followed: true }
  }
}
