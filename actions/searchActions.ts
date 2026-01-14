"use server"

import { connectDB } from "@/lib/db"
import { Media } from "@/models/media.model"
import { IMediaClient } from "@/types/interfaces"

export async function searchMedia(query: string) {
  try {
    await connectDB()

    if (!query || !query.trim()) return []

    const media = await Media.find(
      { $text: { $search: query } },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(50)
      .lean<IMediaClient[]>()

    const parsedData = JSON.parse(JSON.stringify(media))
    return parsedData
  } catch (error) {
    console.error("Text search error:", error)
    return []
  }
}
