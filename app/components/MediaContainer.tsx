"use client"
import { IMediaClient } from "@/types/interfaces"

import Link from "next/link"
import { usePathname } from "next/navigation"
import MediaCard from "./MediaCard"
import MediaSkeleton from "./MediaSkeleton"

interface IMediaContainer {
  media: IMediaClient[]
  isLoading: boolean
  onDelete?: (mediaId: string) => void
  onUnsave?: (mediaId: string) => void
}

export default function MediaContainer({
  media,
  isLoading,
  onDelete,
  onUnsave,
}: IMediaContainer) {
  const pathName = usePathname()

  if (isLoading) {
    return <MediaSkeleton count={12} />
  }

  if (!isLoading && media.length === 0) {
    return (
      <div className="w-full min-h-[70vh] bg-gray-100 rounded-xl p-8 flex flex-col justify-center items-center text-center">
        <p className="text-gray-600 mb-3">No media found yet.</p>
        {pathName === "/" && (
          <Link
            href="/upload"
            className="px-4 py-2 rounded bg-gray-300 font-semibold"
          >
            Upload one? here
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {media.map((item) => (
          <div className="" key={item._id}>
            <MediaCard onUnsave={onUnsave} onDelete={onDelete} item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
