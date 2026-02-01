import { TypeOf, z } from "zod"

export const mediaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be under 50 characters"),

  fileType: z.enum(["image", "video"], {
    error: "File type is required",
  }),

  description: z.string().max(100, "Description is too long").optional(),
  mediaUrl: z.string().url("Invalid media URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
  conrtolers: z.boolean().optional(),
  transformation: z.object({
    height: z.number().positive(),
    width: z.number().positive(),
    quality: z.number().min(1).max(100).optional(),
  }),
  uploadedBy: z.string().min(1, "Uploader ID is required"),
  category: z.string().min(1, "Category is required").max(50, "Wrong input"),
})

export type MediaSchema = z.infer<typeof mediaSchema>
