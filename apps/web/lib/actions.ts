"use server"
import { db } from "drizzle"
import { tags } from "drizzle/schema"
import { eq, desc } from "drizzle"
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
    orderBy: [desc(tags.createdAt)],
  })
  return foundTags
}

export const createTag = async (userId: string, tag: CreateTagForm): Promise<ActionResponse> => {
  try {
    // 检查是否已存在同名标签（基于用户ID）
    const existingTag = await db.query.tags.findFirst({
      where: (tags, { and, eq }) => and(
        eq(tags.name, tag.name),
        eq(tags.userId, userId)
      ),
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

export const updateTag = async (userId: string, tagId: string, tag: CreateTagForm): Promise<ActionResponse> => {
  try {
    // 检查是否已存在同名标签（基于用户ID，排除当前标签）
    const existingTag = await db.query.tags.findFirst({
      where: (tags, { and, eq, ne }) => and(
        eq(tags.name, tag.name),
        eq(tags.userId, userId),
        ne(tags.id, tagId)
      ),
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

    const updatedTag = await db.update(tags)
      .set({
        name: tag.name,
        description: tag.description,
      })
      .where(eq(tags.id, tagId))
      .returning()

    revalidatePath('/')
    
    return {
      success: true,
      data: updatedTag[0],
      message: 'Tag updated successfully!'
    }
  } catch (e) {
    console.error("Failed to update tag:", e)
    return {
      success: false,
      message: 'Failed to update tag',
      error: {
        code: "DATABASE_ERROR",
        details: e instanceof Error ? e.message : "Unknown error occurred"
      }
    }
  }
}

export const deleteTag = async (userId: string, tagId: string): Promise<ActionResponse> => {
  try {
    // 检查标签是否存在且属于当前用户
    const existingTag = await db.query.tags.findFirst({
      where: (tags, { and, eq }) => and(
        eq(tags.id, tagId),
        eq(tags.userId, userId)
      ),
      columns: {
        id: true,
      },
    })

    if (!existingTag) {
      return {
        success: false,
        message: "Tag not found",
        error: {
          code: "TAG_NOT_FOUND",
          details: "The tag you are trying to delete does not exist"
        }
      }
    }

    await db.delete(tags)
      .where(eq(tags.id, tagId))

    revalidatePath('/')
    
    return {
      success: true,
      message: 'Tag deleted successfully!'
    }
  } catch (e) {
    console.error("Failed to delete tag:", e)
    return {
      success: false,
      message: 'Failed to delete tag',
      error: {
        code: "DATABASE_ERROR",
        details: e instanceof Error ? e.message : "Unknown error occurred"
      }
    }
  }
}
