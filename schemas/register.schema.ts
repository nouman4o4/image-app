import { TypeOf, z } from "zod"

export const registerSchema = z.object({
  firstname: z
    .string()
    .min(3, "First name must be at least 3 characters.")
    .max(10, "First name shoud be less than 10 chars."),
  lastname: z
    .string()
    .min(3, "Last name must be at least 3 characters.")
    .max(10, "Last name shoud be less than 10 chars.")
    .optional(),
  email: z
    .string({ error: "Email is required" })
    .email("Invalid email adress."),
  password: z
    .string()
    .min(6, "Password should be more than 6 chars")
    .max(15, "Passwod shloud be less than 15 chars"),
})

export type registerFormData = z.infer<typeof registerSchema>
