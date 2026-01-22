"use client"

import React, { useState } from "react"
import { Upload, X, ChevronLeft } from "lucide-react"
import toast from "react-hot-toast"
import { fileUploadShcema } from "@/schemas/fileuploadSchema"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useFileUpload } from "@/hooks/useFileUpload"

interface FileUploadState {
  file?: string[]
  title?: string[]
  descirption?: string[]
}

export default function FileUpload() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<"image" | "video" | null>(null)
  const [loading, setLoading] = useState(false)

  // const [progress, setProgress] = useState(0)
  const { data: session, status } = useSession()
  const [errors, setErrors] = useState<{
    file?: string[]
    title?: string[]
    descirption?: string[]
  } | null>()
  const router = useRouter()

  const { uploadFile, progress, setProgress } = useFileUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setErrors({ ...errors, file: undefined })
    if (selectedFile.type.startsWith("image/")) setFileType("image")
    else if (selectedFile.type.startsWith("video/")) setFileType("video")
    else {
      setFileType(null)
      toast("Please select an image or video file.")
    }
  }

  // submit upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inputsValdatonResult = fileUploadShcema.safeParse({
      title,
      description,
      file,
    })
    if (!file || !inputsValdatonResult.success) {
      !file && toast.error("Please select a file image/video")
      const errors = inputsValdatonResult?.error?.flatten().fieldErrors
      setErrors(errors)
      return
    }
    //try-catch block

    try {
      setLoading(true)
      const uploadResponse = await uploadFile(file, "/media")
      // save the file in the backend;
      if (!uploadResponse) {
        toast.error("Failed to upload file")
        return
      }
      const body = {
        title: title,
        description: description,
        fileType: file.type.startsWith("video") ? "video" : "image",
        mediaUrl: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl ?? uploadResponse.url,
        transformation: {
          width: uploadResponse.width,
          height: uploadResponse.height,
        },
        uploadedBy: session?.user._id!,
        fileId: uploadResponse.fileId,
      }

      const response = await fetch("/api/media", {
        method: "POST",
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Session expired please login again!")
          await signOut()
        } else {
          toast.error("Failed to upload file")
        }
      }

      toast.success("File uploaded successfully!")
      setLoading(false)
      router.back()
    } catch (error) {
      console.error(error)
      toast.error("Failed uploading the file")
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const changeEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileChange(changeEvent)
    }
  }
  const clearFile = () => {
    setFile(null)
    setFileType(null)
    setPreviewUrl(null)
    setErrors({ ...errors, file: undefined })
  }
  return (
    <div className=" w-full flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button className="text-gray-700 hover:text-gray-900 transition-colors">
            <ChevronLeft
              onClick={() => router.back()}
              className="w-6 h-6 cursor-pointer"
            />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Pin</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !file || !title.trim()}
          className={`py-2 px-6 rounded-full font-semibold transition-all duration-200 ${
            loading || !file || !title.trim()
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600 active:scale-95"
          }`}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row w-full max-w-6xl mx-auto">
        {/* Left Side - Upload Area */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 bg-white">
          <div className="w-full max-w-md">
            {!previewUrl ? (
              <div
                className="mb-8 bg-gray-100 rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-200 border-2 border-dashed border-gray-300"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label htmlFor="file" className="w-full cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800 mb-1">
                        Click to upload
                      </p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">
                        PNG, JPG, GIF or MP4
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            ) : (
              <div className="relative mb-8 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-3 left-3 z-10 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="h-96">
                  {fileType === "image" ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-white font-medium text-sm">
                        Uploading...
                      </p>
                      <p className="text-white/80 text-xs">{progress}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 bg-white border-l border-gray-200 overflow-y-auto">
          <div>
            <div className="mb-8">
              <p className="text-gray-600">
                Add a title and description to your media
              </p>
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-3">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setErrors({ ...errors, title: undefined })
                }}
                placeholder="Add your title"
                maxLength={100}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-2">{title.length}/100</p>
              {errors?.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title[0]}</p>
              )}
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setErrors({ ...errors, descirption: undefined })
                }}
                placeholder="Tell people more about this pin"
                rows={4}
                maxLength={500}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-2">
                {description.length}/500
              </p>
              {errors?.descirption && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.descirption[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
