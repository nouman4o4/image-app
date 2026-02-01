export const getRelatedMedia = async (mediaId: string) => {
  const res = await fetch(`/api/media/related/${mediaId}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    console.log(res)
    throw new Error("Failed to fetch related media")
  }

  return res.json()
}
