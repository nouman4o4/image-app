"use client"
import { searchMedia } from "@/actions/searchActions"
import MediaContainer from "@/app/components/MediaContainer"
import { IMediaClient } from "@/types/interfaces"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"

export default function SearchPage() {
  const [media, setMedia] = useState<IMediaClient[]>([])
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const query = searchParams.get("q")

  useEffect(() => {
    const getMedia = async () => {
      if (!query?.trim()) return
      try {
        setLoading(true)
        const result = await searchMedia(query)
        setMedia(result)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    getMedia()
  }, [query])
  return (
    <div className="w-full min-h-screen p-8 bg-gray-50">
      <div className="h-full">
        <MediaContainer isLoading={loading} media={media ?? []} />
      </div>
    </div>
  )
}
