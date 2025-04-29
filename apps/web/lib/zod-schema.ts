import { z } from "zod";

export const createTagFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  description: z.string()
    .max(200, "Description cannot exceed 200 characters")
    .transform(val => val || ""),
})

export type CreateTagForm = z.infer<typeof createTagFormSchema>

export const updateTagSchema = createTagFormSchema.extend({
  id: z.string(),
})

export const bookmarkSchema = z.object({
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

export type BookmarkFormData = z.infer<typeof bookmarkSchema>

export const createBookmarkSchema = bookmarkSchema
export const updateBookmarkSchema = bookmarkSchema.extend({
  id: z.string(),
})