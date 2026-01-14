"use client"
export default function MediaSkeleton({ count = 10 }: { count?: number }) {
  // `count` is how many skeleton pins to show
  const skeletonArray = Array.from({ length: count })

  return (
    <div className="w-full min-h-[70vh]">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {skeletonArray.map((_, i) => (
          <div
            key={i}
            className="animate-pulse mb-4 bg-gray-200 rounded-lg relative overflow-hidden"
          >
            {/* random heights like Pinterest pins */}
            <div
              className="w-full bg-gray-100 rounded-lg"
              style={{ height: `${Math.floor(Math.random() * 200) + 150}px` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  )
}
