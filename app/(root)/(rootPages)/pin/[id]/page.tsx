import { getMedia } from "@/app/actions/getMedia"
import React from "react"
import MediaComponent from "./components/MediaComponent"
import RelatedMedia from "./components/RelatedMedia"

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let mediaData = null
  let error = null
  try {
    mediaData = await getMedia(id)
  } catch (error) {
    console.error("Error fetching media: ", error)
    error = "Something went wrong while loading this media."
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-600 text-lg bg-gray-100 p-6 rounded-xl shadow">
          {error}
        </p>
      </div>
    )
  }
  if (!mediaData) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center">
        <h4 className="text-3xl font-medium text-gray-600">
          Oops! No media found
        </h4>
      </div>
    )
  }

  return (
    <div className="w-full p-0 md:p-8 bg-gray-50 ">
      <MediaComponent mediaData={mediaData} />
      <div className="px-2">
        <h1 className="text-2xl font-bold text-gray-800 uppercase my-5">
          Related content
        </h1>
        <RelatedMedia />
      </div>
    </div>
  )
}
