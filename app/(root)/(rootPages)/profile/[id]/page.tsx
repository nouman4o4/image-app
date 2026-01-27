"use client"
import React, { useEffect, useState } from "react"
import { LinkIcon, Edit2, Share2 } from "lucide-react"
import Link from "next/link"
import MediaContainer from "@/app/components/MediaContainer"
import { IMediaClient, IUserClient } from "@/types/interfaces"
import {
  getCreatedMedia,
  getSavedMedia,
  getUserData,
} from "@/actions/userActions"
import { useParams, usePathname } from "next/navigation"
import { useUserStore } from "@/store/useUserStore"
import Image from "next/image"
import { deleteMedia } from "@/actions/deleteMedia"
import toast from "react-hot-toast"
import { unsaveMedia } from "@/actions/unsaveMedia"
import ConfirmDeleteModal from "@/app/components/ConfirmtDeleteModal"
import { useSession } from "next-auth/react"
import { toggleFollow } from "@/actions/toggleFollow"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"created" | "saved">("created")
  const [userData, setUserData] = useState<IUserClient>()
  const [media, setMedia] = useState<IMediaClient[]>([])
  const [savedMedia, setSavedMedia] = useState<IMediaClient[]>([])
  const [createdLoading, setCreatedLoading] = useState(true)
  const [savedLoading, setSavedLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [mediaId, setMediaId] = useState("")
  const [isOwner, setIsOwner] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(
    userData?.followers?.length || 0,
  )

  const { data: session, status } = useSession()

  const params = useParams()
  const creatorId = Array.isArray(params.id) ? params.id[0] : params.id
  const { user, setUser } = useUserStore()

  const handleDeleteMedia = async () => {
    if (!user?._id) return
    const deletedMedia = media.find((m) => m._id === mediaId)
    if (!deletedMedia) return
    try {
      setIsDeleting(true)
      setMedia((prev) => prev.filter((m) => m._id !== mediaId))
      const result = await deleteMedia({
        mediaId: mediaId!,
        userId: user._id,
      })

      if (!result.success) {
        toast.error("Failed to delete media")
        setMedia((prev) => [...prev, deletedMedia])
        return
      }

      toast.success("Media deleted")
    } catch (error) {
      console.log(error)
      setMedia((prev) => [...prev, deletedMedia])
    } finally {
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  const onDelete = (mediaId: string) => {
    setIsDeleteOpen(true)
    setMediaId(mediaId)
  }

  const handleUnsave = async (mediaId: string) => {
    if (!user?._id) return

    const unSavedMedia = savedMedia.find((m) => m._id === mediaId)
    if (!unSavedMedia) return

    try {
      setSavedMedia((prev) => prev.filter((m) => m._id !== mediaId))
      setUser({
        ...user,
        savedMedia: user.savedMedia?.filter((id) => id !== mediaId),
      })
      const result = await unsaveMedia({
        mediaId: mediaId!,
        userId: user._id,
      })

      if (!result) {
        toast.error("Failed to unsave media")
        setMedia((prev) => [...prev, unSavedMedia])
        return
      }

      toast.success("Media unsaved")
    } catch (error) {
      toast.error("Failed to unsave media")
      setSavedMedia((prev) => [...prev, unSavedMedia])
    }
  }

  const handleFollow = async () => {
    if (!user?._id || !creatorId) return
    setIsFollowing((prev) => !prev)
    try {
      const result = await toggleFollow({
        currentUserId: user._id,
        targetUserId: creatorId,
      })

      setFollowersCount((prev) => (result.followed ? prev + 1 : prev - 1))
      toast.success(result.followed ? "Followed" : "Unfollowed")
    } catch (error) {
      console.log(error)
      toast.error("Action failed")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // if (status === "unauthenticated" || !session?.user._id) return
      if (!creatorId) return
      setIsOwner(creatorId === user?._id)
      const [userDetails, created] = await Promise.all([
        getUserData(creatorId),
        getCreatedMedia(creatorId),
      ])

      setUserData(userDetails)
      setMedia(created)
      setCreatedLoading(false)
    }
    fetchData()
  }, [creatorId, user])

  useEffect(() => {
    if (!userData) return
    setFollowersCount(userData?.followers?.length || 0)

    if (!userData?.followers) return

    const followed = userData.followers.some(
      (id: any) => id.toString() === user?._id,
    )
    setIsFollowing(followed)
  }, [userData, user])

  const handleTabChange = async (tab: "created" | "saved") => {
    setActiveTab(tab)
    if (tab === "saved" && savedMedia.length === 0) {
      setSavedLoading(true)
      const saved = await getSavedMedia(creatorId as string)
      setSavedMedia(saved)
      setSavedLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4 w-32 h-32 rounded-full overflow-hidden">
            {userData?.profileImage?.imageUrl ? (
              <Image
                className="w-full h-full object-cover"
                src={userData.profileImage.imageUrl}
                alt="UserProfileImage"
                width={100}
                height={100}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br bg-gray-300 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {userData?.firstname?.[0].toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 capitalize">
            {userData?.firstname} {userData?.lastname}
          </h1>

          <p className="text-gray-700 max-w-2xl mx-auto mb-4">
            {userData?.about}
          </p>

          <a
            href={`mailto:${userData?.email}`}
            className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium mb-6"
          >
            <LinkIcon className="w-4 h-4" />
            <span>{userData?.email}</span>
          </a>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{media.length}</p>
              <p className="text-sm text-gray-600">Pins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {followersCount}
              </p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {userData?.totalLikes}
              </p>
              <p className="text-sm text-gray-600">Likes</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center space-x-3">
            <button className="px-6 py-3 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-full transition flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            {user &&
              (isOwner ? (
                <Link
                  href={"/profile/edit"}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit profile</span>
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-3 ${isFollowing ? "bg-gray-500 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"} cursor-pointer text-white font-semibold rounded-full transition flex items-center space-x-2`}
                >
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex justify-center space-x-8">
            {["created", "saved"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as "created" | "saved")}
                className={`pb-4 px-2 font-semibold transition relative cursor-pointer ${
                  activeTab === tab
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 rounded-t"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Media Section */}
        <div>
          {activeTab === "created" ? (
            <MediaContainer
              onDelete={onDelete}
              media={media}
              isLoading={createdLoading}
            />
          ) : (
            <MediaContainer
              onUnsave={handleUnsave}
              media={savedMedia}
              isLoading={savedLoading}
            />
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onCancel={() => {
          setIsDeleteOpen(false)
          setMediaId("")
        }}
        onConfirm={handleDeleteMedia}
        isLoading={isDeleting}
        title="Delete Pin?"
        description="This pin will be permanently removed."
      />
    </div>
  )
}
