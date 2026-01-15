"use server"

import { connectDB } from "@/lib/db"
import { User } from "@/models/user.model"
import mongoose from "mongoose"

interface ToggleSaveArgs {
  mediaId: string
  userId: string
}

export async function toggleSave({ mediaId, userId }: ToggleSaveArgs) {
  if (
    !mongoose.Types.ObjectId.isValid(mediaId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new Error("Invalid IDs")
  }

  try {
    await connectDB()
    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")

    const alreadySaved = user.savedMedia?.some(
      (id: string) => id.toString() === mediaId
    )

    if (alreadySaved) {
      // -------- UNSAVE --------
      await User.findByIdAndUpdate(userId, {
        $pull: { savedMedia: mediaId },
      })

      return { saved: false }
    } else {
      // -------- SAVE --------
      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedMedia: mediaId },
      })

      return { saved: true }
    }
  } catch (error) {
    console.log(error)
    return false
  }
}
