"use client"

import { useEffect, useRef, useState } from "react"
import { X, Search, ChevronDown, LogOut } from "lucide-react"

import { signOut, useSession } from "next-auth/react"
import { useUserStore } from "@/store/useUserStore"
import Image from "next/image"
import FullLogo from "./FullLogo"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const { data: session, status } = useSession()
  const { user, clearUser, setUser } = useUserStore()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const dropDownMenuRef = useRef<HTMLDivElement>(null)
  const chevronRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()

  // close menu when click outside of the menu

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogout = () => {
    setIsMenuOpen(false)
    setUser(null)
    signOut({ redirect: true, callbackUrl: "/login" })
    clearUser()
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropDownMenuRef.current &&
        !chevronRef.current?.contains(event.target as Node) &&
        !dropDownMenuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setSearchQuery(q)
      return
    }
    if (!pathname.startsWith("/search")) setSearchQuery("")
  }, [searchParams, pathname])

  return (
    <nav
      className={`fixed w-full top-0 left-0 right-0 ${
        status === "authenticated" && session.user._id
          ? "pl-[60px] md:pl-20"
          : ""
      } z-50 bg-white shadow-sm border-b border-gray-200`}
    >
      <div className="w-full h-full p-4 flex justify-between gap-5 items-center">
        {!session?.user._id && status !== "authenticated" ? (
          <div>
            <FullLogo />
          </div>
        ) : (
          ""
        )}
        {/* Serach */}
        {status === "authenticated" && session.user._id ? (
          <form
            onSubmit={handleSearchSubmit}
            className={`group grow h-full focus-within:ring-2 ring-blue-300 bg-gray-200 relative pl-5 py-3 rounded-xl overflow-hidden ${user ? "block" : "hidden"}`}
          >
            <Search className="absolute left-3 size-5 top-1/2 -translate-y-1/2 text-gray-700" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              type="text"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              id=""
              className="w-full outline-none pl-5 text-gray-600 font-medium"
              placeholder="Search"
            />
            <div className="absolute top-0 right-0 h-full flex items-center">
              {searchQuery && isFocused ? (
                <X
                  className="mr-2 size-7 cursor-pointer text-gray-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSearchQuery("")}
                />
              ) : (
                ""
              )}
              {/* <div className="flex px-3 bg-black h-full text-white items-center justify-center cursor-pointer">
              <Search />
            </div> */}
            </div>
          </form>
        ) : (
          ""
        )}
        {/* Right User  */}
        <div>
          {status === "authenticated" && session.user._id ? (
            <div className="flex items-center gap-2">
              <div className="size-12 rounded-full overflow-hidden">
                {user?.profileImage?.imageUrl ? (
                  <Image
                    className="w-full h-full object-cover"
                    src={user.profileImage.imageUrl}
                    alt="UserProfileImage"
                    width={50}
                    height={50}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user?.firstname?.[0].toUpperCase()}
                  </div>
                )}
              </div>
              <button
                ref={chevronRef}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="cursor-pointer hover:bg-gray-100 rounded"
              >
                <ChevronDown className="size-5 text-gray-700" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm md:text-lg">
              <Link href={"/login"}>
                <button className="p-3 sm:px-4 rounded-xl sm:rounded-2xl shadow-lg font-medium cursor-pointer bg-gray-200">
                  Log in
                </button>
              </Link>
              <Link href={"/register"}>
                <button className="p-3 sm:px-4 rounded-xl sm:rounded-2xl shadow-lg bg-red-600 text-white font-medium cursor-pointer">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* popup menu */}
      {isMenuOpen ? (
        <div
          ref={dropDownMenuRef}
          className="absolute right-2 top-[75px] shadow-xl bg-white z-20 p-4 rounded-xl"
        >
          <p className="text-xs text-gray-500">Currently in</p>
          <div className="flex flex-col pt-2">
            <Link
              onClick={() => setIsMenuOpen(false)}
              href={`/profile/${user?._id}`}
              className="mb-2 pb-2 border-b border-gray-200"
            >
              <div className="flex gap-3 py-2 px-2 hover:bg-gray-100 rounded-lg ">
                {user?.profileImage?.imageUrl ? (
                  <Image
                    className="size-14 object-cover rounded-full"
                    src={user?.profileImage?.imageUrl || ""}
                    width={50}
                    height={50}
                    alt="Profile"
                  />
                ) : (
                  <div className="size-14  rounded-full bg-gray-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {user?.firstname?.[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full py-2 font-medium rounded bg-gray-50 hover:bg-gray-100 shadow text-gray-700 cursor-pointer"
            >
              <LogOut className="inline size-5 mr-1" /> Log out
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </nav>
  )
}
