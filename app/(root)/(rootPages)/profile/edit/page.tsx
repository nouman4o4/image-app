"use client"
import React, { useActionState, useEffect, useState } from "react"
import { Camera, X, ChevronLeft, Check, AlertCircle } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { IUserClient } from "@/types/interfaces"
import { getUserData, updateUser } from "@/actions/userActions"
import { useUserStore } from "@/store/useUserStore"
import toast from "react-hot-toast"
import { userUpdateSchema } from "@/schemas/userUpdateSchema"
import ProfilePhotoSection from "./components/ProfilePhotoSection"

interface formState {
  firstname: string
  lastname: string
  gender: string
  about: string
  errors?: Record<string, string[] | undefined>
  success?: boolean | undefined
  message?: string
}

export default function EditProfile() {
  const { user, setUser } = useUserStore()
  const router = useRouter()

  const maxChars = 500

  async function submitForm(_: formState, formData: FormData) {
    const firstname = formData.get("firstname") as string
    const lastname = formData.get("lastname") as string
    const gender = formData.get("gender") as string
    const about = formData.get("about") as string
    const data = { firstname, lastname, gender, about }
    if (
      firstname === user?.firstname &&
      lastname === user?.lastname &&
      gender === user.gender &&
      about === user.about
    ) {
      toast.error("No changes are added yet")
      return {
        ...data,
      }
    }
    const parsed = userUpdateSchema.safeParse(data)

    if (!parsed.success) {
      toast.error("Please fill the data correctly")
      return {
        ...data,
        errors: parsed.error.flatten().fieldErrors,
      }
    }

    try {
      const updatedUser: IUserClient = await updateUser(user?._id!, data)
      if (!updatedUser) {
        toast.error("Something went wrong")
        return data
      }

      setUser({
        ...(user as IUserClient),
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        gender: updatedUser.gender,
        about: updatedUser.gender,
      })

      toast.success("User updated sucessfully")
    } catch (error) {
      toast.error("Something went wrong. try again later")
      console.log("error while updating user: ", error)
      return data
    } finally {
      return data
    }
  }

  const [state, formAction, isPending] = useActionState<formState, FormData>(
    submitForm,
    {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      gender: user?.gender || "",
      about: user?.about || "",
      errors: undefined,
      message: "",
    }
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit profile
              </h1>
              <p className="text-sm text-gray-600">Keep your profile updated</p>
            </div>
          </div>
          <button className="cursor-pointer px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition shadow-sm">
            Save
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Photo Section */}
        <ProfilePhotoSection
          firstname={user?.firstname!}
          lastname={user?.lastname!}
          profileImage={user?.profileImage?.imageUrl!}
        />

        {/* Basic Information */}
        <form action={formAction}>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-4 lg:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Basic information
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    defaultValue={state?.firstname || user?.firstname}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="First name"
                  />
                  {state?.errors?.firstname && (
                    <p className="text-sm text-red-400">
                      {state?.errors.firstname[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    defaultValue={state?.lastname || user?.lastname}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  defaultValue={state?.gender || user?.gender}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select pronouns</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="male">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About
                </label>
                <textarea
                  name="about"
                  rows={5}
                  defaultValue={state?.about || user?.about}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition"
                  placeholder="Tell people a bit about yourself..."
                  maxLength={maxChars}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Tell people about yourself, what you love, and what inspires
                    you
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      true ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    50/50
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-8 pb-8">
            <button className="cursor-pointer px-6 py-3 text-gray-700 hover:bg-white hover:shadow-sm font-semibold rounded-full transition border border-gray-300">
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition shadow-sm"
            >
              Save changes
            </button>
          </div>
        </form>

        {/* Online Presence */}
        {/* <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Online presence
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Add links to your website and social profiles
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="username"
                />
                <div className="absolute right-4 top-3.5">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                pinterest.com/{formData.username}
              </p>
            </div>
          </div>
        </div> */}

        {/* Location */}
        {/* <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Location</h2>
          <p className="text-sm text-gray-600 mb-6">
            Let people know where you're from
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              placeholder="City, State/Country"
            />
          </div>
        </div> */}

        {/* Account Management */}
        {/* <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Account management
          </h2>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition border border-gray-200">
              <div className="text-left">
                <p className="font-semibold text-gray-900">Account settings</p>
                <p className="text-sm text-gray-600">
                  Update email, password and privacy settings
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition border border-gray-200">
              <div className="text-left">
                <p className="font-semibold text-gray-900">Claimed accounts</p>
                <p className="text-sm text-gray-600">
                  Verify your website and social accounts
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition border border-gray-200">
              <div className="text-left">
                <p className="font-semibold text-gray-900">Branded content</p>
                <p className="text-sm text-gray-600">
                  Disclose paid partnerships
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div> */}

        {/* Danger Zone */}
        {/* <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Delete account
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all of your content. This
                action cannot be undone.
              </p>
              <button className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-full transition text-sm">
                Delete account
              </button>
            </div>
          </div>
        </div> */}

        {/* Bottom Actions */}
      </div>
    </div>
  )
}
