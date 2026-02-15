"use client"

import { useState } from "react"
import { Sparkles, UploadCloud, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useRouter } from "next/navigation"

type AiEditMode =
  | "edit"
  | "changebg"
  | "removebg"
  | "dropshadow"
  | "retouch"
  | "upscale"
  | "variation"
  | "genfill"

const aiModeOptions: Array<{
  value: AiEditMode
  label: string
  description: string
  requiresPrompt?: boolean
}> = [
  {
    value: "edit",
    label: "Edit image",
    description: "Modify the image content with a prompt.",
    requiresPrompt: true,
  },
  {
    value: "changebg",
    label: "Change background",
    description: "Replace the background using a text prompt.",
    requiresPrompt: true,
  },
  {
    value: "removebg",
    label: "Remove background",
    description: "Erase the background with AI.",
  },
  {
    value: "dropshadow",
    label: "Add drop shadow",
    description: "Remove background and add a soft shadow.",
  },
  {
    value: "retouch",
    label: "Retouch",
    description: "Improve image quality.",
  },
  {
    value: "upscale",
    label: "Upscale",
    description: "Increase resolution up to 16MP.",
  },
  {
    value: "variation",
    label: "Generate variation",
    description: "Create a subtle variation of the original image.",
  },
  {
    value: "genfill",
    label: "Generative fill",
    description: "Extend the canvas and fill new areas.",
  },
]

const encodePrompt = (value: string) =>
  encodeURIComponent(btoa(unescape(encodeURIComponent(value.trim()))))

export default function AiEditorPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [aiMode, setAiMode] = useState<AiEditMode>("edit")
  const [genfillWidth, setGenfillWidth] = useState("1200")
  const [genfillHeight, setGenfillHeight] = useState("800")
  const [genfillMode, setGenfillMode] = useState<"pad_resize" | "pad_extract">(
    "pad_resize",
  )

  const { uploadFile, progress } = useFileUpload()
  const router = useRouter()

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
    setUploadedUrl(null)
    setResultUrl(null)
  }

  const handleAiImageEditing = async () => {
    if (!file) {
      toast.error("Please select an image first.")
      return
    }
    const promptValue = prompt.trim()
    const requiresPrompt = aiModeOptions.find(
      (option) => option.value === aiMode,
    )?.requiresPrompt
    if (requiresPrompt && !promptValue) {
      toast.error("Please add a prompt for this edit.")
      return
    }
    try {
      setLoading(true)
      let sourceUrl = uploadedUrl
      if (!sourceUrl) {
        const fileUploadResponse = await uploadFile(file, "/media")

        if (!fileUploadResponse) {
          toast.error("Failed to upload image")
          console.log(
            "error while uploading file to imagkit: ",
            fileUploadResponse,
          )
          return
        }

        const { url } = fileUploadResponse

        if (!url) {
          toast.error("Failed to upload image")
          return
        }

        sourceUrl = url
        setUploadedUrl(url)
      }

      const encodedPrompt = promptValue ? encodePrompt(promptValue) : ""
      let transformation = ""

      switch (aiMode) {
        case "edit":
          transformation = `e-edit-prompte-${encodedPrompt}`
          break
        case "changebg":
          transformation = `e-changebg-prompte-${encodedPrompt}`
          break
        case "removebg":
          transformation = "e-bgremove"
          break
        case "dropshadow":
          transformation = "e-bgremove:e-dropshadow"
          break
        case "retouch":
          transformation = "e-retouch"
          break
        case "upscale":
          transformation = "e-upscale"
          break
        case "variation":
          transformation = "e-genvar"
          break
        case "genfill": {
          const width = Number(genfillWidth)
          const height = Number(genfillHeight)
          if (!width || !height) {
            toast.error("Please set valid width and height for gen fill.")
            return
          }
          const promptPart = encodedPrompt ? `-prompte-${encodedPrompt}` : ""
          transformation = `bg-genfill${promptPart},w-${width},h-${height},cm-${genfillMode}`
          break
        }
        default:
          break
      }

      if (!transformation) {
        toast.error("Unable to generate image. Try again.")
        return
      }

      setResultUrl(`${sourceUrl}?tr=${transformation}`)
    } catch (error) {
      console.log(error)
      toast.error("Failed to generate the edit.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!resultUrl) {
      toast.error("Generate a result first.")
      return
    }
    try {
      setDownloading(true)
      const response = await fetch(resultUrl)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = `ai-edit-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.log(error)
      toast.error("Failed to download image.")
    } finally {
      setDownloading(false)
    }
  }

  const handleCreatePin = () => {
    if (!resultUrl) {
      toast.error("Generate a result first.")
      return
    }
    router.push(`/upload?imageUrl=${encodeURIComponent(resultUrl)}`)
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
            <Sparkles className="size-4" />
            AI Editor
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Image editor preview
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload an image, preview it instantly, then choose an AI edit to
            apply with ImageKit.
          </p>
        </section> */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center mb-4 gap-2 text-sm font-semibold text-red-600">
            <Sparkles className="size-4" />
            AI Editor
          </div>
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
                  htmlFor="ai-mode"
                  className="block text-sm font-medium text-gray-700"
                >
                  AI edit mode
                </label>
                <select
                  id="ai-mode"
                  value={aiMode}
                  onChange={(event) =>
                    setAiMode(event.currentTarget.value as AiEditMode)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-red-200"
                >
                  {aiModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {
                    aiModeOptions.find((option) => option.value === aiMode)
                      ?.description
                  }
                </p>
              </div>

              {aiMode === "genfill" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target width
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={genfillWidth}
                      onChange={(event) =>
                        setGenfillWidth(event.currentTarget.value)
                      }
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Target height
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={genfillHeight}
                      onChange={(event) =>
                        setGenfillHeight(event.currentTarget.value)
                      }
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Crop mode
                    </label>
                    <select
                      value={genfillMode}
                      onChange={(event) =>
                        setGenfillMode(
                          event.currentTarget.value as
                            | "pad_resize"
                            | "pad_extract",
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-red-200"
                    >
                      <option value="pad_resize">Pad resize</option>
                      <option value="pad_extract">Pad extract</option>
                    </select>
                  </div>
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="ai-prompt"
                  className="block text-sm font-medium text-gray-700"
                >
                  AI prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.currentTarget.value)
                  }}
                  id="ai-prompt"
                  placeholder="e.g. Add soft sunset light and sharpen the subject."
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none focus:border-gray-300 focus:ring-2 focus:ring-red-200"
                />
                {aiModeOptions.find((option) => option.value === aiMode)
                  ?.requiresPrompt ? (
                  <p className="mt-2 text-xs text-gray-500">
                    This mode requires a prompt.
                  </p>
                ) : null}
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
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm ${
                    loading
                      ? "cursor-not-allowed bg-red-300"
                      : "cursor-pointer bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loading ? "Generating edit" : "Generate edit"}
                </button>
                {progress > 0 ? (
                  <span className="self-center text-xs text-gray-500">
                    Upload {progress}%
                  </span>
                ) : null}
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
              <p className="text-sm font-medium text-gray-700">AI result</p>
              <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resultUrl}
                    alt="AI result"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <ImageIcon className="size-10" />
                    <p className="text-sm">No result yet</p>
                  </div>
                )}
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-white/85 backdrop-blur">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.15),_transparent_60%)]" />
                    <div className="relative flex w-[80%] max-w-xs flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 px-5 py-5 text-center shadow-xl">
                      <div className="relative flex size-12 items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-red-100 blur-md" />
                        <div className="absolute inset-0 rounded-full border-2 border-red-200 border-t-red-500 animate-spin" />
                        <div className="flex size-9 items-center justify-center rounded-full bg-white shadow">
                          <Sparkles className="size-4 text-red-500" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {progress > 0 && progress < 100
                            ? `Uploading ${progress}%`
                            : "Applying AI edit..."}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          This usually takes a few seconds.
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-red-500" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownload}
                  disabled={!resultUrl || downloading}
                  className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm ${
                    !resultUrl || downloading
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "cursor-pointer bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {downloading ? "Downloading..." : "Download"}
                </button>
                <button
                  onClick={handleCreatePin}
                  disabled={!resultUrl}
                  className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm ${
                    !resultUrl
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "cursor-pointer bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Create new pin
                </button>
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
