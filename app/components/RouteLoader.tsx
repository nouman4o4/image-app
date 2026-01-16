"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function RouteLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 400)
    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="relative w-16 h-16"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-full" />
            <span className="absolute bottom-2 left-1 w-3 h-3 bg-gray-700 rounded-full opacity-70" />
            <span className="absolute bottom-2 right-1 w-3 h-3 bg-gray-700 rounded-full opacity-40" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
