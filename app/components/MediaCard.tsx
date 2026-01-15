import { toggleLike } from "@/actions/toggleLike"
import { toggleSave } from "@/actions/toggleSave"
import { useUserStore } from "@/store/useUserStore"
import { IMediaClient } from "@/types/interfaces"
import { Video, Image } from "@imagekit/next"
import { Trash2, Upload } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

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

  useEffect(() => {
    if (user?._id) {
      setIsCreator(item.uploadedBy.toString() === user?._id.toString())
    }
    if (user?._id && !hasInteractedWithSave) {
      const isInitiallySaved = user?.savedMedia?.some(
        (id: any) => id.toString() === item._id
      )
      setIsSaved(!!isInitiallySaved)
    }
  }, [user?._id, item])

  return (
    <div
      key={item._id}
      className="break-inside-avoid relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 group"
    >
      <Link href={`/media/${item._id}`} className="z-20">
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

      <div className="buttons-overlay-div absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-black/10 cursor-pointer pointer-events-none">
        <div className="w-full h-full flex flex-col justify-between items-end p-2 pointer-events-none z-20">
          <div className="w-fit pointer-events-auto ">
            {isProfilePage && onUnsave ? (
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
            )}
          </div>
          <div className="w-full flex items-center justify-end pointer-events-auto">
            <button className={`p-2 rounded-xl bg-white cursor-pointer `}>
              <Upload className="size-5" />
            </button>
            {isProfilePage && isCreator && onDelete && (
              <button
                onClick={() => onDelete(item._id!)}
                className="p-2 rounded-xl ml-2 text-red-600 bg-white z-20 hover:bg-red-600 hover:text-white transition cursor-pointer"
              >
                <Trash2 className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
