"use client"

import { useState } from "react"
import { Sparkles, UploadCloud, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useFileUpload } from "@/hooks/useFileUpload"
import { deleteImageKitFile } from "@/lib/imageKitDeleteFile"

export default function AiEditorPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [file, setFile] = useState<File | null>()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const { uploadFile, progress, setProgress } = useFileUpload()

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setPreviewUrl(null)
      setFileName("")
      setFile(null)
      return
    }
    setFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setFileName(file.name)
  }

  const handleAiImageEditing = async () => {
    toast("Ai functionality is being implemented")
    return
    if (!prompt || !file) {
      toast.error("Please select an image and write a proper prompt!")
      return
    }
    try {
      setLoading(true)
      const fileUploadResponse = await uploadFile(file, "/media")

      if (!fileUploadResponse) {
        toast.error("Failed to upload image")
        return
      }

      const { fileId, url } = fileUploadResponse

      if (!fileId || !url) {
        toast.error("failed to upload image")
        return
      }

      const apiResponse = await fetch("/api/ai/edit-image", {
        method: "POST",
        body: JSON.stringify({ prompt, url }),
      })
      await deleteImageKitFile(fileId)
      console.log("apiResponse: ", apiResponse)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <Sparkles className="size-4" />
            AI Editor
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Image editor preview
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload an image, preview it instantly, then describe the edit you
            want the AI to perform.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload image
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center transition hover:border-gray-300">
                <UploadCloud className="size-8 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Drag & drop or click to upload
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {fileName ? (
                <p className="text-xs text-gray-500">Selected: {fileName}</p>
              ) : (
                ""
              )}

              <div>
                <label
                  htmlFor="ai-prompt"
                  className="block text-sm font-medium text-gray-700"
                >
                  AI prompt
                </label>
                <textarea
                  onChange={(e) => {
                    setPrompt(e.currentTarget.value)
                  }}
                  id="ai-prompt"
                  placeholder="e.g. Remove background, add soft sunset light, and sharpen the subject."
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPrompt("")}
                  className="rounded-xl cursor-pointer bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                >
                  Clear
                </button>
                <button
                  onClick={handleAiImageEditing}
                  className="rounded-xl cursor-pointer bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                >
                  {loading ? "Genrating edits" : "Generate edit"}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Preview</p>
              <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <ImageIcon className="size-10" />
                    <p className="text-sm">No image selected</p>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-600">
                Tip: Be specific about lighting, background, and subject focus
                to get the best results.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
