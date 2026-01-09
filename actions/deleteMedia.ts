"use server"

import { connectDB } from "@/lib/db"
import Media from "@/models/media.model"
import ImageKit from "imagekit"
import { revalidatePath } from "next/cache"

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

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
      await imagekit.deleteFile(media.fileId)
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
