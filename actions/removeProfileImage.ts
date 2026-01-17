"use server"

import { connectDB } from "@/lib/db"
import { deleteImageKitFile } from "@/lib/imageKitDeleteFile"
import { User } from "@/models/user.model"

export async function removeProfileImage(userId: string, fileId: string) {
  if (!userId) throw new Error("Unauthorized")
  if (!fileId) return

  try {
    await connectDB()

    const user = await User.findById(userId)
    if (!user) throw new Error("User not found")

    // If no profile image, nothing to do
    if (user.profileImage?.identifier) {
      const deleteResponse = await deleteImageKitFile(
        user.profileImage.identifier
      )
      if (!deleteResponse.success) {
        throw new Error(deleteResponse.message)
      }
    }
    // 1️⃣ Delete from ImageKit

    // 2️⃣ Remove from DB
    user.profileImage = null
    await user.save()

    return { success: true }
  } catch (error) {
    console.error("Remove profile image failed:", error)
  }
}
