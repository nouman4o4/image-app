import { removeProfileImage } from "@/actions/removeProfileImage"
import { updateUserProfileImage } from "@/actions/userActions"
import ConfirmDeleteModal from "@/app/components/ConfirmtDeleteModal"
import { useFileUpload } from "@/hooks/useFileUpload"
import { useUserStore } from "@/store/useUserStore"
import { IUserClient } from "@/types/interfaces"
import { Camera } from "lucide-react"
import Image from "next/image"
import React, { useState } from "react"
import toast from "react-hot-toast"
interface Props {
  firstname: string
  lastname: string
  profileImage: string
}
const ProfilePhotoSection: React.FC<Props> = ({
  firstname,
  lastname,
  profileImage,
}: Props) => {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState("")
  const [isSelectedImageChanged, setIsSelectedImageChanged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOpenRemove, setIsOpenRemove] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { progress, uploadFile } = useFileUpload()
  const { user, setUser } = useUserStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    if (!selectedFile.type.startsWith("image/")) {
      toast("Please select an image or video file.")
      return
    }

    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
    setIsSelectedImageChanged(true)
  }
  const submitUpload = async () => {
    if (!file) {
      toast.error("Please select an image")
      return
    }

    try {
      setLoading(true)
      const uploadResponse = await uploadFile(file, "/profile-imges")
      if (!uploadResponse) {
        toast.error("Failed to upload profile image")
        setFile(undefined)
        setPreviewUrl("")
        return
      }

      // db action call here to update the user profile image in backend
      const updatedUser = await updateUserProfileImage(
        { imageUrl: uploadResponse.url!, identifier: uploadResponse.fileId! },
        user?._id!
      )
      if (!updatedUser) {
        toast.error("Something went wrong")
        setFile(undefined)
        setPreviewUrl("")
        return
      }
      const updatedUserData: IUserClient = {
        ...(user as IUserClient),
        _id: user!._id,
        profileImage: updatedUser.profileImage,
      }

      setUser(updatedUserData)

      toast.success("Profile image updated sucessfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload profile image")
    } finally {
      setLoading(false)
      setIsSelectedImageChanged(false)
      setFile(undefined)
      setPreviewUrl("")
    }
  }

  const handleRemoveDp = async () => {
    const profileImage = user?.profileImage
    if (!user) return
    try {
      setIsDeleteLoading(true)
      setUser({ ...user, profileImage: { imageUrl: "", identifier: "" } })

      const result = await removeProfileImage(
        user._id,
        profileImage?.identifier!
      )
      if (!result || result.success) {
        // setUser({ ...user, profileImage: profileImage })
        toast.error("Failed to remove profile image")
      }
    } catch (error) {
      console.log(error)
      setUser({ ...user, profileImage: profileImage })
      toast.error("Failed to remove profile image")
    } finally {
      setIsOpenRemove(false)
      setIsDeleteLoading(false)
      setUser({ ...user, profileImage: profileImage })
    }
  }
  return (
    <div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 md:p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Profile photo
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden relative">
              {!profileImage && !previewUrl && firstname && lastname ? (
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {firstname[0]} {lastname[0]}
                </div>
              ) : (
                <>
                  {loading ? (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-gray-200 text-sm font-medium ">
                      Uploading...
                    </div>
                  ) : (
                    ""
                  )}
                  <Image
                    className="w-full h-full object-cover"
                    src={previewUrl || profileImage || ""}
                    width={100}
                    height={100}
                    alt="Profile Image"
                  />
                </>
              )}
            </div>
            <label
              htmlFor="file"
              className="absolute hover:cursor-pointer -bottom-2 -right-2 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-md"
            >
              <input
                type="file"
                name="file"
                id="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <Camera className="w-5 h-5 text-gray-700" />
            </label>
          </div>

          <div className="flex-1 mt-4 md:mt-0 pt-2">
            <p className="text-gray-700 mb-4 text-center">
              Use a photo that clearly shows your face. You can also upload a
              logo or brand image.
            </p>
            <div className="flex items-center space-x-3">
              <button
                // disabled={!isSelectedImageChanged}
                onClick={() => {
                  submitUpload()
                }}
                className={`px-5 border-1 py-2.5 bg-gray-100 hover:bg-gray-200 font-medium rounded-full transition text-sm ${
                  isSelectedImageChanged
                    ? " border-red-400"
                    : "border-transparent"
                } ${
                  loading
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-900 cursor-pointer"
                }`}
              >
                {loading ? "Uploading..." : "Upload photo"}
              </button>
              <button
                disabled={user?.profileImage?.identifier ? false : true}
                onClick={() => setIsOpenRemove(true)}
                className={`px-5  py-2.5 text-gray-50 ${
                  user?.profileImage?.identifier
                    ? "bg-red-600 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }  font-medium rounded-full transition text-sm`}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isOpenRemove}
        onCancel={() => setIsOpenRemove(false)}
        onConfirm={handleRemoveDp}
        title="Remove Display Picture?"
        description="This action cannot be undone."
        isLoading={isDeleteLoading}
      />
    </div>
  )
}

export default ProfilePhotoSection
