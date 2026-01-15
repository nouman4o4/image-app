"use server"

import { connectDB } from "@/lib/db"
import { User } from "@/models/user.model"
import mongoose from "mongoose"

interface UnsaveMediaArgs {
  mediaId: string
  userId: string
}

export async function unsaveMedia({ mediaId, userId }: UnsaveMediaArgs) {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(mediaId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new Error("Invalid IDs")
    }

    await connectDB()
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")

    const alreadySaved = user.savedMedia?.some(
      (id: string) => id.toString() === mediaId
    )

    if (!alreadySaved) {
      return false
    }
    // -------- UNSAVE --------
    await User.findByIdAndUpdate(userId, {
      $pull: { savedMedia: mediaId },
    })

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
