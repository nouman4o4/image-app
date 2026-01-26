"use client"
import { getMedia } from "@/app/actions/getMedia"
import React, { useEffect, useState } from "react"
import MediaComponent from "./components/MediaComponent"
import RelatedMedia from "./components/RelatedMedia"
import { IMediaClient } from "@/types/interfaces"
import { useParams } from "next/navigation"

export default function page() {
  const [mediaData, setMediaData] = useState<IMediaClient | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>()
  const params = useParams()
  const id = params.id

  // let mediaData = null
  // let error = null
  useEffect(() => {
    ;(async () => {
      try {
        setIsLoading(true)
        const result = await getMedia(id as string)
        setMediaData(result)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.error("Error fetching media: ", error)
        setError(error || "Something went wrong while loading this media.")
      }
    })()
  }, [id])
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-600 text-lg bg-gray-100 p-6 rounded-xl shadow">
          {error}
        </p>
      </div>
    )
  }

  // if (isLoading && !mediaData) {
  //   return <div>Loading...</div>
  // }
  // else if (!mediaData) {
  //   return (
  //     <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center">
  //       <h4 className="text-3xl font-medium text-gray-600">
  //         Oops! No media found
  //       </h4>
  //     </div>
  //   )
  // }

  return (
    <div className="w-full p-0 md:p-8 bg-gray-50 ">
      <MediaComponent isLoading={isLoading} mediaData={mediaData!} />
      <div className="px-2">
        <h1 className="text-2xl font-bold text-gray-800 uppercase my-5">
          Related content
        </h1>
        <RelatedMedia />
      </div>
    </div>
  )
}
