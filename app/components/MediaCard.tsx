"use client"
import { toggleLike } from "@/actions/toggleLike"
import { toggleSave } from "@/actions/toggleSave"
import { useUserStore } from "@/store/useUserStore"
import { IMediaClient } from "@/types/interfaces"
import { Video, Image } from "@imagekit/next"
import {
  Bookmark,
  Download,
  Heart,
  Share2,
  Trash,
  Trash2,
  Upload,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import toast from "react-hot-toast"
import { BsThreeDots } from "react-icons/bs"
import { motion, AnimatePresence } from "motion/react"
import SheetAction from "./SheetAction"

export default function MediaCard({
  item,
  onDelete,
  onUnsave,
}: {
  item: IMediaClient
  onDelete?: (mediaId: string) => void
  onUnsave?: (mediaId: string) => void
}) {
  const [isSaved, setIsSaved] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [hasInteractedWithSave, setHasInteractedWithSave] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const { user } = useUserStore()
  const pathname = usePathname()
  const isProfilePage = pathname.startsWith("/profile")

  const handleSave = async () => {
    setHasInteractedWithSave(true)
    setIsSaved((prev) => !prev)

    try {
      await toggleSave({
        mediaId: item._id!,
        userId: user?._id!,
      })
    } catch (error) {
      // rollback on failure
      setIsSaved((prev) => !prev)
      console.log(error)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/pin/${item._id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: "Checkout this pin",
          url: url,
        })
      } catch (err) {
        // user cancelled — ignore
      }
    } else {
      // fallback
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    }
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      toast.success("Pin downloaded successfully")
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download file")
    }
  }

  const handleLike = async () => {
    setIsLiked((prev) => !prev)
    try {
      await toggleLike({ mediaId: item._id!, userId: user?._id! })
    } catch (error) {
      toast.error("Failed to like")
      setIsLiked(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      setIsCreator(item.uploadedBy.toString() === user?._id.toString())
    }
    if (user?._id && !hasInteractedWithSave) {
      const isInitiallySaved = user?.savedMedia?.some(
        (id: any) => id.toString() === item._id,
      )
      setIsSaved(!!isInitiallySaved)
    }
    const alreadyLiked =
      user?.totalLikes?.length! > 0 &&
      user?.totalLikes?.some((id) => id.toString() == user._id)
    setIsLiked(alreadyLiked || false)
  }, [user?._id, item])

  return (
    <div>
      <div
        key={item._id}
        className="break-inside-avoid relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 group"
      >
        <Link href={`/pin/${item._id}`} className="z-20">
          {item.fileType === "image" ? (
            <Image
              src={item.mediaUrl}
              width={500}
              height={500}
              alt={item.title || "media"}
              className="w-full h-auto object-cover"
            />
          ) : (
            <Video
              urlEndpoint={item.mediaUrl}
              src={item.mediaUrl}
              width={500}
              height={500}
              className="w-full h-auto object-cover rounded-t-2xl"
            />
          )}
        </Link>
        {item.fileType === "video" ? (
          <div className="video-duration absolute top-2 left-2 group-hover:opacity-0 opacity-100  ">
            <p className="p-1 rounded-lg bg-gray-200/70 text-gray-600 text-[10px]">
              0:08
            </p>
          </div>
        ) : (
          ""
        )}
        <div className="buttons-overlay-div absolute hidden md:block inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-black/10 cursor-pointer pointer-events-none">
          <div className="w-full h-full flex flex-col justify-between items-end p-2 pointer-events-none z-20">
            <div className="w-fit pointer-events-auto ">
              {user &&
                (isProfilePage && onUnsave ? (
                  <button
                    onClick={() => onUnsave(item._id!)}
                    className={`p-3 rounded-2xl bg-gray-500
                 ${
                   isCreator ? "cursor-not-allowed" : "cursor-pointer"
                 } text-white font-medium hover:scale-105 scale-95 transition-all duration-100`}
                  >
                    Unsave
                  </button>
                ) : (
                  <button
                    disabled={isCreator}
                    onClick={handleSave}
                    className={`p-3 rounded-2xl  ${
                      isSaved || isCreator ? "bg-gray-700" : "bg-red-600"
                    } ${
                      isCreator ? "cursor-not-allowed" : "cursor-pointer"
                    } text-white font-medium hover:scale-105 scale-95 transition-all duration-100`}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </button>
                ))}
            </div>
            <div className="w-full flex items-center justify-end pointer-events-auto">
              <button
                onClick={handleShare}
                className={`p-2 rounded-xl bg-white cursor-pointer `}
              >
                <Upload className="size-5" />
              </button>
              {isProfilePage && isCreator && onDelete && (
                <button
                  onClick={() => {
                    onDelete(item._id!)
                  }}
                  className="p-2 rounded-xl ml-2 text-red-600 bg-white z-20 hover:bg-red-600 hover:text-white transition cursor-pointer"
                >
                  <Trash2 className="size-5" />
                </button>
              )}
            </div>
          </div>
        </div>{" "}
      </div>
      {/* mobile intereaction */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-70 md:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120) {
                  setIsMenuOpen(false)
                }
              }}
            >
              <div className="bg-white rounded-t-2xl p-4 shadow-xl">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                {/* Actions */}
                <div className="space-y-2">
                  <SheetAction onClick={handleLike}>
                    <Heart
                      className={`size-5 ${isLiked ? "fill-red-600 text-transparent" : ""}`}
                    />
                    <span className="font-medium">Like</span>
                  </SheetAction>

                  {!isCreator ? (
                    <SheetAction onClick={handleSave}>
                      <Bookmark className="size-5" />
                      <span className="font-medium">Save</span>
                    </SheetAction>
                  ) : (
                    ""
                  )}

                  <SheetAction
                    onClick={() => handleDownload(item.mediaUrl, item.title)}
                  >
                    <Download className="size-5" />
                    <span className="font-medium">Download</span>
                  </SheetAction>

                  <SheetAction onClick={handleShare}>
                    <Share2 className="size-5" />
                    <span className="font-medium">Share</span>
                  </SheetAction>

                  {isCreator && onDelete ? (
                    <SheetAction
                      onClick={() => {
                        setIsMenuOpen(false)
                        onDelete(item._id!)
                      }}
                      className="text-red-600"
                    >
                      <Trash className="size-5" />
                      <span className="font-medium">Delete</span>
                    </SheetAction>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isProfilePage ? (
        <div className="block md:hidden text-end">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="bg-white px-2 py-1  rounded cursor-pointer"
          >
            <BsThreeDots />
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  )
}
