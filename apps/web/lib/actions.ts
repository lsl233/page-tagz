"use server"
import { db } from "drizzle"
import { tags } from "drizzle/schema"
import { eq } from "drizzle"
import { CreateTagForm } from "@/lib/zod-schema"
import { revalidatePath } from "next/cache"

export type ActionResponse = {
  success: boolean
  data?: any
  message: string
  error?: {
    code: string
    details?: string
  }
}

export const getUserTags = async (userId: string) => {
  const foundTags = await db.query.tags.findMany({
    where: eq(tags.userId, userId),
  })
  return foundTags
}

export const createTag = async (userId: string, tag: CreateTagForm): Promise<ActionResponse> => {
  try {
    // 检查是否已存在同名标签
    const existingTag = await db.query.tags.findFirst({
      where: eq(tags.name, tag.name),
      columns: {
        id: true,
      },
    })

    if (existingTag) {
      return {
        success: false,
        message: "Tag already exists",
        error: {
          code: "DUPLICATE_TAG",
          details: "A tag with this name already exists"
        }
      }
    }

    const createdTag = await db.insert(tags).values({
      ...tag,
      userId,
    }).returning()

    revalidatePath('/')
    
    return {
      success: true,
      data: createdTag[0],
      message: 'Tag created successfully!'
    }
  } catch (e) {
    console.error("Failed to create tag:", e)
    return {
      success: false,
      message: 'Failed to create tag',
      error: {
        code: "DATABASE_ERROR",
        details: e instanceof Error ? e.message : "Unknown error occurred"
      }
    }
  }
}
