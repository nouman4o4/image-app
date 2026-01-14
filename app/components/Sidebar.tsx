"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, Home, User2, PlusSquare } from "lucide-react"
import { useUserStore } from "@/store/useUserStore"
import { useSession } from "next-auth/react"
import NLogo from "./NLogo"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("home")
  const { user } = useUserStore()
  const { data: session } = useSession()
  const pathname = usePathname()

  const menuItems = [
    {
      id: "logo",
      icon: <NLogo />,
      href: "/",
      label: "Pinterest",
      isLogo: true,
    },
    {
      id: "home",
      icon: <Home />,
      href: "/",
      label: "Home",
    },
    // {
    //   id: "explore",
    //   icon: (
    //     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    //       <path d="M10 16.5c-3.584 0-6.5-2.916-6.5-6.5S6.416 3.5 10 3.5s6.5 2.916 6.5 6.5-2.916 6.5-6.5 6.5zm10.856 3.944l-4.806-4.806A8.456 8.456 0 0018.5 10c0-4.687-3.813-8.5-8.5-8.5S1.5 5.313 1.5 10s3.813 8.5 8.5 8.5a8.456 8.456 0 005.638-2.45l4.806 4.806a1.5 1.5 0 102.122-2.122z" />
    //     </svg>
    //   ),
    //   href: "/explore",
    //   label: "Explore",
    // },
    {
      id: "create",
      icon: <PlusSquare />,
      href: "/upload",
      label: "Create",
    },
    {
      id: "notifications",
      icon: <Bell />,
      href: "#",
      label: "Notifications",
    },
    {
      id: "profile",
      icon: <User2 />,
      href: "/profile/" + session?.user._id,
      label: "Profile",
    },
  ]

  useEffect(() => {
    if (pathname === "/") setActiveItem("home")
    console.log({ pathname })
    console.log({ activeItem })
  }, [pathname])

  return (
    <aside className="fixed left-0 top-0 h-screen w-[60px] md:w-[80px] pt-3 bg-white border-r border-gray-200 flex flex-col gap-6 items-center py-2 z-50">
      {menuItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={() => setActiveItem(item.id === "logo" ? "home" : item.id)}
          className={`
            w-12 h-12 flex items-center justify-center rounded-full
            transition-all duration-200 my-1
            ${item.isLogo ? "text-red-600 hover:bg-red-50 mb-2" : ""}
            ${
              activeItem === item.id && !item.isLogo
                ? "bg-black text-white"
                : !item.isLogo
                ? "text-gray-700 hover:bg-gray-100"
                : ""
            }
          `}
          title={item.label}
        >
          {item.icon}
        </Link>
      ))}
    </aside>
  )
}
