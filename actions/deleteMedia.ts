"use server"

import { connectDB } from "@/lib/db"
import { deleteImageKitFile } from "@/lib/imageKitDeleteFile"
import { Media } from "@/models/media.model"

import { revalidatePath } from "next/cache"

interface DeleteMediaParams {
  mediaId: string
  userId: string
}

export async function deleteMedia({ mediaId, userId }: DeleteMediaParams) {
  try {
    await connectDB()

    const media = await Media.findById(mediaId)

    if (!media) {
      throw new Error("Media not found")
    }

    // 🔐 Authorization check
    if (media.uploadedBy.toString() !== userId) {
      throw new Error("Not authorized to delete this media")
    }

    // 🗑 Delete from ImageKit
    if (media.fileId) {
      await deleteImageKitFile(media.fileId)
    }

    // 🗑 Delete from DB
    await media.deleteOne()

    // 🔄 Revalidate pages
    revalidatePath("/")
    revalidatePath(`/profile/${userId}`)

    return { success: true }
  } catch (error) {
    console.error("Delete media error:", error)
    return { success: false }
  }
}
