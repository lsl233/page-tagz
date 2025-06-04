import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const createTagFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  description: z.string()
    .max(200, "Description cannot exceed 200 characters")
    .transform(val => val || ""),
})

export const updateTagSchema = createTagFormSchema.extend({
  id: z.string(),
})

export const bookmarkSchema = z.object({
  id: z.string().optional(),
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title is too long")
    .trim(),
  url: z.string()
    .url("Please enter a valid URL")
    .max(500, "URL is too long")
    .trim(),
  description: z.string()
    .max(500, "Description is too long")
    .transform(val => val || "")
    .optional(),
  tags: z.array(z.string())
    .min(1, "Please select at least one tag")
})

export const createBookmarkSchema = bookmarkSchema
export const updateBookmarkSchema = bookmarkSchema.extend({
  id: z.string(),
})

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})



export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
})

export type BookmarkFormData = z.infer<typeof bookmarkSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type CreateTagForm = z.infer<typeof createTagFormSchema>
export type UpdateTagForm = z.infer<typeof updateTagSchema>


export const bookmarkSchemaResolver = zodResolver(bookmarkSchema)
export const loginSchemaResolver = zodResolver(loginSchema)
export const registerSchemaResolver = zodResolver(registerSchema)
export const createTagFormSchemaResolver = zodResolver(createTagFormSchema)
export const updateTagSchemaResolver = zodResolver(updateTagSchema)

