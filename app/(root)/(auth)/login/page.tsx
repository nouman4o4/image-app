"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FaGoogle } from "react-icons/fa"
import { signIn, useSession } from "next-auth/react"
import { getUserData } from "@/actions/userActions"
import { useUserStore } from "@/store/useUserStore"
import { loginSchema } from "@/schemas/login.shcema"
import Image from "next/image"

export default function Login() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setUser, user } = useUserStore()
  const searchParams = useSearchParams()

  const [errors, setErrors] = useState<{
    email?: string[]
    password?: string[]
  }>({})
  const [isPending, setIsPending] = useState(false)

  // CLIENT-SIDE LOGIN HANDLER
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})
    setIsPending(true)
    const redirect = searchParams.get("redirect") || "/"

    const email = event.currentTarget.email.value
    const password = event.currentTarget.password.value

    try {
      // Validate with Zod
      const parsed = loginSchema.safeParse({ email, password })
      if (!parsed.success) {
        setErrors(parsed.error.flatten().fieldErrors)
        setIsPending(false)
        return
      }

      // NextAuth signIn
      const result = await signIn("credentials", {
        redirect: false,
        email: parsed.data.email,
        password: parsed.data.password,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        setIsPending(false)
        return
      }
      if (session?.user._id) {
        const userData = await getUserData(session?.user?._id)

        if (userData) {
          setUser(userData)
        }
      }

      toast.success("Logged in successfully!")
      router.replace(redirect)
    } catch (error) {
      console.log("error while loging in: ", error)
    } finally {
      setIsPending(false)
    }
  }

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
    if (user) {
      return
    }
    if (status === "authenticated" && session?.user?._id) {
      getUserData(session.user._id).then((userData) => {
        setUser(userData!)
      })
    }
  }, [status, session])

  return (
    <main className="py-6 md:pt-0 md:py-10 flex justify-center px-2 md:px-4 ">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-4 md:p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              disabled={isPending}
              className="mt-1 w-full h-11 border border-gray-300 rounded-xl px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              disabled={isPending}
              className="mt-1 w-full h-11 border border-gray-300 rounded-xl px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full h-11 cursor-pointer text-sm font-semibold bg-red-600 text-white rounded-lg shadow-md hover:opacity-90 transition ${
              isPending ? "cursor-not-allowed" : ""
            }`}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="relative my-6">
          <div className="h-px bg-gray-200" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
            OR
          </span>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Not on our platform yet?{" "}
        </p>
        <div className="space-y-3 my-4 mb-6">
          <button
            type="button"
            className="w-full p-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </button>
          <button
            type="button"
            onClick={handleSigninWithGoogle}
            className="w-full p-2 bg-gray-100 rounded-lg flex cursor-pointer items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <Image
              src="google.svg"
              alt="google"
              className="w-6"
              width={30}
              height={30}
            />
            <span>
              <span className="hidden font-medium md:inline">
                Continue with
              </span>{" "}
              Google
            </span>
          </button>
        </div>
      </div>
    </main>
  )
}
