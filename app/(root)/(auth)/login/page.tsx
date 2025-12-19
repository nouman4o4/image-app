"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FaGoogle } from "react-icons/fa"
import { signIn, useSession } from "next-auth/react"
import { getUserData } from "@/actions/userActions"
import { useUserStore } from "@/store/useUserStore"
import { loginSchema } from "@/schemas/login.shcema"

export default function Login() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setUser, user } = useUserStore()

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

    const email = event.currentTarget.email.value
    const password = event.currentTarget.password.value

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
    router.push("/")

    setIsPending(false)
  }

  useEffect(() => {
    if (user && user !== null) {
      return
    }
    if (status === "authenticated" && session?.user?._id) {
      getUserData(session.user._id).then((userData) => {
        setUser(userData!)
        console.log("setUser: ", userData)
      })
    }
  }, [status, session])

  return (
    <main className="pt-6 md:pt-0 md:py-10 min-h-screen flex justify-center md:px-4">
      <div className="w-full max-w-md bg-white shadow-lg md:rounded-2xl p-3 md:p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500">Sign in to continue</p>
        </div>

        {/* Social buttons */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => toast.success("Google login coming soon!")}
            className="w-full p-2 border rounded-lg flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <FaGoogle className="w-6 h-6 text-[#DB4437]" />
            <span>
              <span className="hidden md:inline">Continue with</span> Google
            </span>
          </button>
        </div>

        {/* OR Separator */}
        <div className="relative mb-6">
          <div className="h-px bg-gray-200" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
            OR
          </span>
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
              placeholder="john.doe@example.com"
              disabled={isPending}
              className="mt-1 w-full h-11 border border-gray-300 rounded-lg px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Enter your password"
              disabled={isPending}
              className="mt-1 w-full h-11 border border-gray-300 rounded-lg px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className={`w-full h-11 text-sm font-semibold bg-red-600 text-white rounded-lg shadow-md hover:opacity-90 transition ${
              isPending ? "cursor-not-allowed" : ""
            }`}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Not on our platform yet?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
