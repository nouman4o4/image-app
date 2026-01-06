"use server"

import { Media } from "@/models/media.model"

export async function getComments(mediaId: string) {
  const media = await Media.findById(mediaId)
    .select("comments")
    .populate("comments.user", "firstname lastname profileImage")
    .lean()

  if (!media) throw new Error("Media not found")
  const parseData = JSON.parse(JSON.stringify(media))
  return parseData
}
