"use server"

import { Media } from "@/models/media.model"
import { User } from "@/models/user.model"
import mongoose from "mongoose"

import { revalidatePath } from "next/cache"

interface ToggleLikeArgs {
  mediaId: string
  userId: string
}

export async function toggleLike({ mediaId, userId }: ToggleLikeArgs) {
  if (
    !mongoose.Types.ObjectId.isValid(mediaId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new Error("Invalid IDs")
  }

  const media = await Media.findById(mediaId)
  if (!media) throw new Error("Media not found")

  const user = await User.findById(userId)
  if (!user) throw new Error("User not found")

  const alreadyLiked = media.likes.some(
    (id: string) => id.toString() === userId
  )

  if (alreadyLiked) {
    // -------- UNLIKE --------
    await Media.findByIdAndUpdate(mediaId, {
      $pull: { likes: userId },
    })

    await User.findByIdAndUpdate(userId, {
      $pull: { likedMedia: mediaId },
      $inc: { totalLikes: -1 },
    })

    return { liked: false }
  } else {
    // -------- LIKE --------
    await Media.findByIdAndUpdate(mediaId, {
      $addToSet: { likes: userId },
    })

    await User.findByIdAndUpdate(userId, {
      $addToSet: { likedMedia: mediaId },
      $inc: { totalLikes: 1 },
    })

    return { liked: true }
  }
}
