import { ChevronDown } from "lucide-react"
import React, { useState } from "react"

// bring required data form the parent compo
export default function CommentsSection() {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  const comments = [1, 2, 3]
  return (
    <div className="pt-4 pb-[70px] border-gray-300 border-t-1 border-t-gray-300 relative">
      <div className="head flex justify-between mb-3">
        {comments?.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span>45</span> Comments
            </h2>
            <button className="cursor-pointer">
              <ChevronDown className="size-7 hover:bg-gray-200 rounded p-1" />
            </button>
          </>
        ) : (
          <div className="text-lg font-semibold text-gray-900">No Comments</div>
        )}
      </div>

      {/* Dummy Comments */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <p className="text-gray-900 font-medium">Alice</p>
            <p className="text-gray-700">This is amazing! 😍</p>
          </div>
        </div>
      </div>

      {/* Add Comment Input */}
      <div className="flex items-center space-x-2 absolute bottom-3 left-2 right-2">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition">
          Add
        </button>
      </div>
    </div>
  )
}
