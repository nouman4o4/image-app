"use client"
import { createComment } from "@/actions/createComment"
import { deleteComment } from "@/actions/deleteComment"
import { getComments } from "@/actions/getComments"
import { useUserStore } from "@/store/useUserStore"
import { ChevronDown, Trash2 } from "lucide-react"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"

interface IComment {
  _id: string
  content: string
  user: {
    _id: string
    firstname: string
    lastname: string
    profileImage: { imageUrl: string }
  }
  likes: string[]
}

// bring required data form the parent compo

export default function CommentsSection({ mediaId }: { mediaId: string }) {
  const [comments, setComments] = useState<IComment[]>([])
  const [content, setContent] = useState<string>("")
  const [commentLoading, setCommentsLoading] = useState(false)
  const { user } = useUserStore()

  const handleCreateComment = async () => {
    if (content.length === 0) {
      toast.error("Please add some content in the comment input.")
      return
    }
    if (!user?._id) return
    try {
      const createdComment = await createComment({
        content,
        userId: user._id,
        mediaId,
      })

      comments.push({
        ...createdComment,
        user: {
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          profileImage: { imageUrl: user.profileImage?.imageUrl },
        },
      })
      setContent("")
      toast.success("Comment added")
    } catch (error) {
      comments.pop()
      console.log(error)
    }
  }

  const handleDeleteComment = async (commentId: string, index: number) => {
    if (!user?._id) return
    const updatedComments = comments.toSpliced(index, 1)
    setComments(updatedComments)
    const commentToDelete = comments[index]
    try {
      const result = await deleteComment({
        mediaId,
        commentId,
        userId: user._id,
      })
      if (!result) {
        toast.error("Failed To Delete")
      }
      toast.success("Comment Deleted")
    } catch (error) {
      const updatedComments = comments.toSpliced(index, 0, commentToDelete)
      setComments(updatedComments)
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchComments = async () => {
      if (!mediaId) return
      try {
        setCommentsLoading(true)
        const result = await getComments(mediaId)
        if (!result.comments) return

        setComments(result.comments)
      } catch (error) {
        console.log(error)
      } finally {
        setCommentsLoading(false)
      }
    }
    fetchComments()
  }, [mediaId])

  return (
    <div className="pt-4 pb-[70px] border-gray-300 border-t-1 border-t-gray-300 relative">
      <div className="head flex justify-between mb-3">
        {comments?.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span>{comments.length}</span> Comments
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
        {commentLoading ? (
          <div>Loading...</div>
        ) : (
          comments?.map((comment, index) => (
            <div
              key={comment._id}
              className="flex items-center justify-between space-x-3 bg-gray-100 rounded-lg p-2"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 text-white font-bold">
                  <Image
                    className="w-full h-full object-cover"
                    alt="Profile"
                    src={comment.user?.profileImage?.imageUrl || ""}
                    width={50}
                    height={50}
                  />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {comment.user.firstname} {comment.user.lastname}
                  </p>
                  <p className="text-gray-600">{comment.content}</p>
                </div>
              </div>
              {comment.user._id.toString() === user?._id ? (
                <button
                  onClick={() => handleDeleteComment(comment._id, index)}
                  className="p-1 rounded cursor-pointer text-red-600 hover:bg-red-600 hover:text-white tranistion-all ease-in duration-150 "
                >
                  <Trash2 className="size-5 " />
                </button>
              ) : (
                ""
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <div className="flex items-center space-x-2 absolute bottom-3 left-0 right-0">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          disabled={content.length === 0}
          onClick={handleCreateComment}
          className={`px-4 py-2 ${
            content.length === 0 ? "cursor-not-allowed" : "cursor-pointer"
          } bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition`}
        >
          Add
        </button>
      </div>
    </div>
  )
}
