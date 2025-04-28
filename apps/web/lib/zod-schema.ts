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