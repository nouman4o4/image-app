"use client" // This component must be a client component

import { signOut, useSession } from "next-auth/react"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import { fileUploadShcema } from "@/schemas/fileuploadSchema"
import { useFileUpload } from "@/hooks/useFileUpload"

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

  return (
    <div className="h-auto min-h-[calc(100vh-55px)] w-full flex items-center justify-center bg-gray-50 overflow-hidden py-0 md:py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white shadow-md md:rounded-2xl p-4 md:p-8 border border-gray-100"
      >
        <div className="text-center mb-10">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div> */}
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
            Upload Your Media
          </h2>
          <p className="text-gray-600">
            Share your creative work with the world
          </p>
        </div>
        <div className="mb-6 relative">
          <label className="block text-gray-700 font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors({ ...errors, title: undefined })
            }}
            placeholder="Enter a catchy title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-400  focus:ring-pink-100 transition-all duration-200 text-gray-800 placeholder:text-gray-400"
          />
          <div className="error absolute left-1 -bottom-5 text-sm text-red-300">
            {errors?.title ? errors.title[0] : ""}
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            placeholder="Write something about your post..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:border-pink-400  focus:ring-pink-100 transition-all duration-200 text-gray-800 placeholder:text-gray-400"
          ></textarea>
          <div className="error absolute left-1 -bottom-4 text-sm text-red-300">
            {errors?.descirption ? errors.descirption[0] : ""}
          </div>
        </div>

        <div className="mb-7">
          <label className="block text-gray-700 font-medium mb-2">
            Upload File
          </label>
          {!previewUrl && (
            <div
              className={`w-fit mx-auto relative border-dashed border-2  rounded-lg px-4 flex items-center justify-center py-4 ${
                errors?.file ? "border-red-300" : "border-gray-300"
              }`}
            >
              <label
                htmlFor="file"
                className="text-center w-fit p-3 cursor-pointer flex items-center flex-col gap-3"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-10 h-10 text-purple-600" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  Drop your files here or click to browse
                </p>

                <input
                  type="file"
                  name="file"
                  id="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <div className="error absolute left-1 -bottom-6 text-sm text-red-300">
                {errors?.file ? errors.file[0] : ""}
              </div>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="relative mb-5 rounded-lg md:rounded-xl overflow-hidden border border-gray-200 shadow-sm flex justify-center p-4 pt-8 md:p-8">
            <div className="absolute top-1 right-1 md:top-5 md:right-5 size-6 md:size-8 rounded p-[1px] bg-gray-400 hover:scale-110 transition-transform duration-100">
              <X
                className="text-white cursor-pointer w-full h-full"
                onClick={() => {
                  setFile(null)
                  setFileType(null)
                  setPreviewUrl("")
                  setErrors({ ...errors, file: undefined })
                }}
              />
            </div>
            {fileType === "image" ? (
              <Image
                src={previewUrl}
                alt="preview"
                className="w-auto h-auto max-h-[400px] object-contain rounded md:rounded-lg"
                width={400}
                height={400}
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-auto h-auto max-h-[400px] object-contain rounded-lg"
              />
            )}

            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                <div className="flex flex-col items-center space-y-6 p-6 rounded-2xl bg-white/10 shadow-xl border border-white/20 backdrop-blur-md">
                  {/* Uploading text */}
                  <p className="text-white font-medium text-lg tracking-wide animate-pulse">
                    Uploading your file...
                  </p>
                  {/* Progress bar */}(
                  <div className="w-64 bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 rounded-full transition-all duration-300 ease-out animate-pulse"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  )
                  <p className="text-sm text-gray-200 font-light">
                    {progress}% complete
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition duration-75 cursor-pointer ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  )
}
