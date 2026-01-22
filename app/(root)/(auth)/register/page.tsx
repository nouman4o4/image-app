"use client"
import { submitRegister } from "@/actions/registerAction"
import { useActionState, useEffect, useState } from "react"
import { FormState } from "@/actions/registerAction"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { FaGoogle, FaLinkedin, FaGithub } from "react-icons/fa"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
export default function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const [state, formAction, ispending] = useActionState<FormState, FormData>(
    submitRegister,
    {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      errors: undefined,
      success: undefined,
      message: "",
    },
  )

  const handleSigninWithGoogle = () => {
    try {
      setIsPending(true)
      signIn("google", { callbackUrl: "/" })
    } catch (error) {
      toast.error("Failed to login with google")
      console.log("google login failed: ", error)
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (state?.success) {
      toast.success("User registered successfully.")
      setTimeout(() => router.push("/login"), 500)
    } else if (!state?.success && state?.message) {
      toast.error(state?.message || "Couldn't register the user")
    }
  }, [state, router])

  return (
    <div className="md:min-h-screen py-6 md:pt-0 md:py-10 flex items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Join us
            </h1>
            <p className="text-gray-500">Find new ideas to try</p>
          </div>

          {/* Signup form */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="firstname"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                defaultValue={state?.firstname}
                id="firstname"
                name="firstname"
                type="text"
                placeholder="John"
                className="h-11 w-full px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {state?.errors?.firstname && (
                <p className="text-sm text-red-400">
                  {state?.errors.firstname[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lastname"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                defaultValue={state?.lastname}
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Doe"
                className="h-11 w-full px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {state?.errors?.lastname && (
                <p className="text-sm text-red-400">
                  {state?.errors.lastname[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                defaultValue={state?.email}
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="h-11 px-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {state?.errors?.email && (
                <p className="text-sm text-red-400">{state?.errors.email[0]}</p>
              )}
            </div>
            {/* password */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                {" "}
                <input
                  defaultValue={state?.password}
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="*********"
                  className="h-11 px-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-2 top-1/5 text-gray-500 cursor-pointer transition-all duration-75"
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </div>
              </div>

              {state?.errors?.password && (
                <p className="text-sm text-red-400">
                  {state?.errors.password[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-red-600 text-white rounded-lg shadow-md hover:opacity-90 transition cursor-pointer"
            >
              {ispending || isPending ? "Creating account..." : "Submit"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="h-px bg-gray-200" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
              OR
            </span>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Already have an account?{" "}
          </p>
          <div className="space-y-3 my-4 mb-6">
            <button
              type="button"
              className="w-full p-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
            >
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in
              </Link>
            </button>
            <button
              type="button"
              onClick={handleSigninWithGoogle}
              className="w-full p-2 bg-gray-100 rounded-lg flex cursor-pointer items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
            >
              <FcGoogle className="size-6" />
              {isPending ? (
                <p>Loading...</p>
              ) : (
                <span>
                  <span className="hidden font-medium md:inline">
                    Continue with
                  </span>{" "}
                  Google
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
