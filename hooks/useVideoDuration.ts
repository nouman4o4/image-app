import { useEffect, useState } from "react"

export function useVideoDuration(url?: string) {
  const [duration, setDuration] = useState<number | null>(null)

  useEffect(() => {
    if (!url) return

    const video = document.createElement("video")
    video.src = url
    video.preload = "metadata"

    const handleLoaded = () => {
      setDuration(video.duration)
    }

    video.addEventListener("loadedmetadata", handleLoaded)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded)
      video.src = ""
    }
  }, [url])
  if (!duration) return
  const m = Math.floor(duration / 60)
  const s = Math.floor(duration % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
