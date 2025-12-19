"use client"

import React, { useEffect, useState } from "react"
import MediaContainer from "../../components/MediaContainer"
import { apiClient } from "@/lib/api-client"
import { IMediaClient } from "@/types/interfaces"
import { useUserStore } from "@/store/useUserStore"
import { useSession } from "next-auth/react"
import { getUserData } from "@/actions/userActions"

export default function Home() {
  const [media, setMedia] = useState<IMediaClient[]>([])
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useUserStore()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user._id && !user) {
        const user = await getUserData(session.user._id)
        if (user) setUser(user)
      } else return
    }
    const fetchAllMedia = async () => {
      try {
        setLoading(true)
        const response: any = await apiClient.getMedia()
        if (!response.ok) {
          console.log("error happened")
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
    // fetchUser()
    fetchAllMedia()
  }, [])

  return (
    <div className="w-full min-h-screen p-8 bg-gray-50">
      <div className="h-full">
        <MediaContainer isLoading={loading} media={media ?? []} />
      </div>
    </div>
  )
}
