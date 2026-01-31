"use client"

import MediaContainer from "@/app/components/MediaContainer"
import { apiClient } from "@/lib/api-client"
import { IMediaClient } from "@/types/interfaces"

import { useEffect, useState } from "react"

export default function RelatedMedia() {
  const [media, setMedia] = useState<IMediaClient[]>()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchAllMedia = async () => {
      try {
        setLoading(true)
        const response: any = await fetch("/api/media", {
          cache: "force-cache",
        })
        if (!response.ok) {
          return
        }
        if (response.status! === "500") {
          console.error("Could not fetch the media due to server error.")
          return
        }
        const jsonData = await response.json()
        setMedia(jsonData.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllMedia()
  }, [])

  return (
    <div>
      <MediaContainer media={media ?? []} isLoading={loading} />
    </div>
  )
}
