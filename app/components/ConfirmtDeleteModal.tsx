"use client"

import { X } from "lucide-react"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  title?: string
  description?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteModal({
  isOpen,
  title = "Delete?",
  description = "Are you sure you want to delete this? This action cannot be undone.",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
        >
          <X className="size-5 text-gray-600" />
        </button>

        {/* Content */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>

        <p className="text-sm text-gray-600 mb-6">{description}</p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
