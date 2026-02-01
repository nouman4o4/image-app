"use client"

import { getRelatedMedia } from "@/actions/getRelatedMedia"
import MediaContainer from "@/app/components/MediaContainer"
import { apiClient } from "@/lib/api-client"
import { IMediaClient } from "@/types/interfaces"

import { useEffect, useState } from "react"

export default function RelatedMedia({ mediaId }: { mediaId: string }) {
  const [media, setMedia] = useState<IMediaClient[]>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mediaId) return

    const fetchRelated = async () => {
      try {
        const data = await getRelatedMedia(mediaId)
        setMedia(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [mediaId])

  return (
    <div>
      <MediaContainer media={media ?? []} isLoading={loading} />
    </div>
  )
}
