"use client"
import Sidebar from "@/app/components/Sidebar"
import { useUserStore } from "@/store/useUserStore"
import { useSession } from "next-auth/react"

import React, { useEffect } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useUserStore()
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log({ status }, session?.user)
    if (!session?.user || status !== "authenticated") {
      setUser(null)
    }
  }, [status, user])

  return (
    <div>
      {status === "authenticated" && session.user._id ? (
        <div>
          <Sidebar />
        </div>
      ) : (
        ""
      )}
      <div className={`${user ? "ml-[60px] md:ml-[80px]" : ""}`}>
        {children}
      </div>
    </div>
  )
}
