"use client"
import Sidebar from "@/app/components/Sidebar"
import { useUserStore } from "@/store/useUserStore"

import React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore()

  return (
    <div>
      {user ? (
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
