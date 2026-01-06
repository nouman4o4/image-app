"use server"

import { Media } from "@/models/media.model"

interface DeleteCommentArgs {
  mediaId: string
  commentId: string
  userId: string
}

export async function deleteComment({
  mediaId,
  commentId,
  userId,
}: DeleteCommentArgs) {
  const media = await Media.findOne({
    _id: mediaId,
    "comments._id": commentId,
  })

  if (!media) throw new Error("Media or comment not found")

  const comment = media.comments.find(
    (c: any) => c._id.toString() === commentId
  )

  if (!comment) throw new Error("Comment not found")

  if (comment.user.toString() !== userId) {
    throw new Error("Not authorized to delete this comment")
  }

  await Media.findByIdAndUpdate(mediaId, {
    $pull: { comments: { _id: commentId } },
  })

  return { deleted: true }
}
