"use client"

import React, { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useUserStore } from "@/store/useUserStore"
import { getUserData } from "@/actions/userActions"

export function AuthUserLoader({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { user, setUser } = useUserStore()

  useEffect(() => {
    if (status !== "authenticated") return
    if (user) return
    if (session?.user?._id) {
      getUserData(session.user._id).then((userData) =>
        userData ? setUser(userData) : console.log("user not found: ", userData)
      )
    }
  }, [status, session, user])

  return children
}
