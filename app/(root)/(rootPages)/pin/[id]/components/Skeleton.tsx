import React from "react"

export default function Skeleton() {
  return (
    <div className="w-full px-4 max-w-6xl animate-pulse">
      <div className="w-full max-w-7xl">
        <div className="w-full p-4 md:p-6 grid md:grid-cols-2 gap-4 lg:gap-6 items-start bg-white rounded-3xl shadow-lg">
          {/* LEFT: Media skeleton */}
          <div className="relative">
            <div className="relative w-full md:w-3/4 mx-auto rounded-2xl overflow-hidden">
              <div className="w-full h-[420px] md:h-[520px] bg-gray-200 rounded-xl" />
            </div>
          </div>

          {/* RIGHT: Content skeleton */}
          <div className="flex flex-col gap-6">
            {/* Header actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="w-8 h-4 bg-gray-200 rounded" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              </div>

              <div className="w-24 h-10 bg-gray-200 rounded-full" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <div className="w-3/4 h-8 bg-gray-200 rounded-lg" />
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-5/6 h-4 bg-gray-200 rounded" />
            </div>

            {/* Creator section */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Comments skeleton */}
            <div className="space-y-4 mt-4">
              <div className="w-1/3 h-5 bg-gray-200 rounded" />

              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="w-1/4 h-3 bg-gray-200 rounded" />
                    <div className="w-full h-3 bg-gray-200 rounded" />
                    <div className="w-5/6 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
