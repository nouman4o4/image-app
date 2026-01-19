"use client"

import React, { useEffect, useState } from "react"
import MediaContainer from "../../components/MediaContainer"
import { apiClient } from "@/lib/api-client"
import { IMediaClient } from "@/types/interfaces"

export default function Home() {
  const [media, setMedia] = useState<IMediaClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllMedia = async () => {
      try {
        setLoading(true)
        const response: any = await apiClient.getMedia()
        if (!response.ok) {
          return
        }
        if (response.status! === "500") {
          console.error("Could not fetch the media due to server error.")
          return
        }

        setMedia(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllMedia()
  }, [])

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <div className="h-full">
        <MediaContainer isLoading={loading} media={media ?? []} />
      </div>
    </div>
  )
}
