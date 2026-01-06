"use server"

import { Media } from "@/models/media.model"
import mongoose from "mongoose"

interface CreateCommentArgs {
  mediaId: string
  userId: string
  content: string
}

export async function createComment({
  mediaId,
  userId,
  content,
}: CreateCommentArgs) {
  if (!content.trim()) {
    throw new Error("Comment cannot be empty")
  }

  const comment = {
    _id: new mongoose.Types.ObjectId(),
    content,
    user: userId,
    likes: [],
    createdAt: new Date(),
  }

  await Media.findByIdAndUpdate(mediaId, {
    $push: { comments: comment },
  })

  const parsData = JSON.parse(JSON.stringify(comment))
  return parsData
}
