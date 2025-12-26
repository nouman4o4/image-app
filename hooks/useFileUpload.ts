// /hooks/useFileUpload.ts
import { useState } from "react"

import { apiClient } from "@/lib/api-client"
import { upload } from "@imagekit/next"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export function useFileUpload() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  const uploadFile = async (file: File, distination: string) => {
    setProgress(0)

    try {
      // Upload file to ImageKit

      const authRes = await fetch("/api/auth/imagekit-auth")
      const auth = await authRes.json()
      const { signature, expire, token } = auth.authenticationParameters
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
        signature,
        expire,
        token,
        folder: distination,
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100

            setProgress(Math.round(percent))
          }
        },

        // Abort signal to allow cancellation of the upload if needed.
        // abortSignal: abortController.signal,
      })

      // if (!uploadResponse) {
      //   toast.error("Failed to upload file")
      //   return false
      // }

      //  save metadata in the backend
      // const body = {
      //   title: meta.title,
      //   description: meta.description,
      //   fileType: file.type.startsWith("video") ? "video" : "image",
      //   mediaUrl: uploadResponse.url,
      //   thumbnailUrl: uploadResponse.thumbnailUrl ?? uploadResponse.url,
      //   transformation: {
      //     width: uploadResponse.width,
      //     height: uploadResponse.height,
      //   },
      //   uploadedBy: userId,
      // }

      // const response = await fetch("/api/media", {
      //   method: "POST",
      //   body: JSON.stringify(body),
      // })
      // if (!response.ok) {
      //   if (response.status === 403) {
      //     toast.error("Session expired please login again!")
      //     await signOut();
      //     return false
      //   } else {
      //     toast.error("Failed to upload file")
      //     return false
      //   }
      // }
      return uploadResponse
    } catch (err) {
      console.error("Upload error:", err)

      return false
    }
  }

  return { uploadFile, progress, setProgress }
}
