"use client"
import { motion } from "motion/react"

export default function SheetAction({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96, backgroundColor: "#f3f4f6" }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left select-none ${className}`}
    >
      {children}
    </motion.button>
  )
}
