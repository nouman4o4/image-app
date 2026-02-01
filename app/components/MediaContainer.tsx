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
      <div className="w-full min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          {/* Illustration / Placeholder */}
          <div
            className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 
                    flex items-center justify-center shadow-inner"
          >
            <svg
              className="w-20 h-20 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 01-3 16.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 11l3 3 5-5"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Nothing here yet
            </h2>
            <p className="text-gray-500 text-sm">
              Start uploading pins to inspire others and build your collection.
            </p>
          </div>

          {/* CTA */}
          {pathName === "/" && (
            <Link
              href="/upload"
              className="px-6 py-3 rounded-full bg-red-600 text-white font-semibold
                   hover:bg-red-700 active:scale-95 transition-all duration-200"
            >
              Create your first Pin
            </Link>
          )}
        </div>
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
