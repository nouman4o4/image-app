"use client"
import { useEffect, useState } from "react"

export default function MediaSkeleton({ count = 10 }: { count?: number }) {
  const [heights, setHeights] = useState<number[]>([])

  useEffect(() => {
    // Generate random heights ONLY on client after hydration
    const generated = Array.from(
      { length: count },
      () => Math.floor(Math.random() * 200) + 150,
    )
    setHeights(generated)
  }, [count])

  // While heights not ready, render nothing (or fixed skeleton)
  if (heights.length === 0) return null

  return (
    <div className="w-full min-h-[70vh]">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {heights.map((h, i) => (
          <div
            key={i}
            className="animate-pulse mb-4 bg-gray-200 rounded-lg relative overflow-hidden"
          >
            <div
              className="w-full bg-gray-100 rounded-lg"
              style={{ height: `${h}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
