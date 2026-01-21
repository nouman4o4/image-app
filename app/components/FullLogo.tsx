import React from "react"
import NLogo from "./NLogo"
import Link from "next/link"

export default function FullLogo() {
  return (
    <Link href={"/"}>
      <div className="flex items-center text-lg md:text-xl font-bold capitalize p-1 sm:px-3 rounded-lg sm:bg-gray-100 sm:shadow shadow-gray-200">
        <p className="hidden sm:block">Pi</p> <NLogo />{" "}
        <p className="hidden sm:block">terest</p>
      </div>
    </Link>
  )
}
