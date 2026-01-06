"use client"

import { useEffect, useState } from "react"
import {
  Heart,
  Share2,
  MessageCircle,
  Download,
  MoreHorizontal,
  Bookmark,
  ExternalLink,
} from "lucide-react"
import { IMediaClient, IUserClient } from "@/types/interfaces"
import Image from "next/image"
import { Video } from "@imagekit/next"
import CommentsSection from "./CommentsSection"
import { useUserStore } from "@/store/useUserStore"
import { getUserData } from "@/actions/userActions"
import { useSession } from "next-auth/react"
import { toggleLike } from "@/actions/toggleLike"
import { toggleSave } from "@/actions/toggleSave"

export default function MediaComponent({
  mediaData,
}: {
  mediaData: IMediaClient
}) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likes, setLikes] = useState(mediaData.likes?.length || 0)
  const { user } = useUserStore()
  const [creator, setCreator] = useState<IUserClient>()
  const [hasInteracted, setHasInteracted] = useState(false)
  const [hasInteractedWithSave, setHasInteractedWithSave] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const { data: session, status } = useSession()

  const userAuthenticated = status === "authenticated" && user !== null

  const handleLike = async () => {
    setHasInteracted(true)
    setIsLiked((prev) => !prev)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
    await toggleLike({ mediaId: mediaData._id!, userId: user?._id! })
  }

  const handleSave = async () => {
    setHasInteractedWithSave(true)
    setIsSaved((prev) => !prev)

    try {
      await toggleSave({
        mediaId: mediaData._id!,
        userId: user?._id!,
      })
    } catch (error) {
      // rollback on failure
      setIsSaved((prev) => !prev)
      console.log(error)
    }
  }

  useEffect(() => {
    const getCreator = async () => {
      const data = await getUserData(mediaData.uploadedBy)
      setCreator(data)
    }
    getCreator()

    if (user?._id) {
      setIsCreator(mediaData.uploadedBy.toString() === user?._id.toString())
    }

    if (user?._id && !hasInteracted) {
      const liked = mediaData?.likes?.some(
        (id: any) => id.toString() === user?._id
      )
      setIsLiked(!!liked)
    }

    if (user?._id && !hasInteractedWithSave) {
      const isInitiallySaved = user?.savedMedia?.some(
        (id: any) => id.toString() === mediaData._id
      )
      setIsSaved(!!isInitiallySaved)
    }
  }, [user?._id, mediaData])

  if (!mediaData) {
    return (
      <div className="text-center mt-20 text-gray-500">Media not found</div>
    )
  }

  return (
    <div className=" w-full px-4 max-w-6xl">
      {/* Container with glassmorphism effect */}
      <div className="w-full max-w-7xl">
        <div
          className={`w-full p-4 md:p-6 grid md:grid-cols-2 gap-2 md:gap-4 lg:gap-6 items-start bg-white rounded-3xl shadow-lg
            
          `}
        >
          {/* Media Section - Left Side */}
          <div className="relative group ">
            <div className="relative w-full md:w-3/4 rounded-2xl overflow-hidden mx-auto">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

              {mediaData.fileType === "image" ? (
                <Image
                  src={mediaData.mediaUrl}
                  alt={mediaData.title}
                  className="w-full max-h-screen object-cover rounded md:rounded-xl "
                  width={mediaData.transformation?.width}
                  height={mediaData.transformation?.height}
                />
              ) : (
                <Video
                  src={mediaData.mediaUrl}
                  controls
                  className="w-full max-h-screen  h-auto object-cover rounded-3xl"
                />
              )}

              {/* Floating action button */}
              {/* <button
                onClick={() => setIsSaved(!isSaved)}
                className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full border-1 border-gray-300 shadow-lg hover:scale-110 transition-transform duration-200"
              >
                <Bookmark
                  className={`w-5 h-5 transition-colors ${
                    isSaved ? "fill-red-500 stroke-red-500" : "stroke-gray-700"
                  }`}
                />
              </button> */}
            </div>{" "}
          </div>

          {/* Content Section - Right Side */}
          <div className="flex flex-col gap-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex items-center">
                  <button
                    onClick={handleLike}
                    className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <Heart
                      className={`${
                        isLiked ? "fill-red-600 text-red-600" : ""
                      }`}
                    />{" "}
                  </button>{" "}
                  <span className="font-medium"> {likes}</span>
                </div>
              </div>

              <div>
                <button
                  disabled={isCreator}
                  onClick={handleSave}
                  className={`px-6 mr-3 py-2.5 ${
                    isSaved || isCreator ? "bg-gray-700" : "bg-red-600"
                  } ${
                    isCreator ? "cursor-not-allowed" : " cursor-pointer"
                  } text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 `}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {mediaData.title}
              </h1>

              {/* Description */}
              <p className="text-gray-800 leading-relaxed">
                {mediaData.description}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br overflow-hidden from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {creator?.profileImage ? (
                    <Image
                      className="w-full h-full object-cover"
                      src={creator?.profileImage?.imageUrl}
                      alt="Profile"
                      width={50}
                      height={50}
                    />
                  ) : (
                    creator?.firstname.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {creator?.firstname} {creator?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {creator?.followers?.length || "0"} followers
                  </p>
                </div>
              </div>
            </div>
            {/* Comments section */}
            <CommentsSection mediaId={mediaData._id!} />
          </div>
        </div>
      </div>
    </div>
  )
}
