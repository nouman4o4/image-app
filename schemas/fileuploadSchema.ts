import z from "zod"

export const fileUploadShcema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, "File is required.")
    .refine(
      (file) => file && file.size <= 100 * 1024 * 1024, // 100MB
      "File size must be under 100MB.",
    ),
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be under 20 characters"),
  category: z.string().min(1, "Category is required").max(50, "Wrong input"),

  description: z.string().max(100, "Description is too long").optional(),
})
