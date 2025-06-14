"use server"
import { db } from "@packages/drizzle"
import { tags, bookmarks, bookmarkTags } from "@packages/drizzle/schema"
import { eq, desc, inArray, sql } from "@packages/drizzle"
import { CreateTagForm, BookmarkFormData } from "@/lib/zod-schema"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { createErrorResponse, createSuccessResponse, ErrorCode } from "./api-utils"

export type ActionResponse = {
  success: boolean
  data?: any
  message: string
  error?: {
    code: string
    details?: string
  }
}

export const getUserTags = async (userId?: string) => {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // 使用子查询获取标签计数
  const foundTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      userId: tags.userId,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      bookmarkCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${bookmarkTags}
        WHERE ${bookmarkTags.tagId} = ${tags.id}
      )`
    })
    .from(tags)
    .where(eq(tags.userId, session.user.id))
    .orderBy(desc(tags.createdAt));
  return foundTags;
}

export const createTag = async (userId: string, tag: CreateTagForm): Promise<ActionResponse> => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          details: "You are not authorized to create a tag"
        }
      }
    }
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
      userId: session.user.id,
    })
      .returning()

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

export const createBookmark = async (userId: string, bookmark: BookmarkFormData): Promise<ActionResponse> => {
  try {
    // 检查是否已存在相同URL的书签（基于用户ID）
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: (bookmarks, { and, eq }) => and(
        eq(bookmarks.url, bookmark.url),
        eq(bookmarks.userId, userId)
      ),
      columns: {
        id: true,
      },
    })

    if (existingBookmark) {
      return {
        success: false,
        message: "Bookmark already exists",
        error: {
          code: "DUPLICATE_BOOKMARK",
          details: "A bookmark with this URL already exists"
        }
      }
    }

    // 创建书签
    const [createdBookmark] = await db.insert(bookmarks).values({
      userId,
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
    }).returning()

    // 创建书签和标签的关联
    await db.insert(bookmarkTags).values(
      bookmark.tags.map(tagId => ({
        bookmarkId: createdBookmark.id,
        tagId,
      }))
    )

    revalidatePath('/')

    return {
      success: true,
      data: createdBookmark,
      message: 'Bookmark created successfully!'
    }
  } catch (e) {
    console.error("Failed to create bookmark:", e)
    return {
      success: false,
      message: 'Failed to create bookmark',
      error: {
        code: "DATABASE_ERROR",
        details: e instanceof Error ? e.message : "Unknown error occurred"
      }
    }
  }
}

export const getBookmarksByTag = async (tagId: string) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    // 使用关系查询获取书签及其所有标签
    const foundBookmarks = await db.query.bookmarks.findMany({
      where: (bookmarks, { eq, and, exists }) => and(
        eq(bookmarks.userId, session?.user?.id as string),
        exists(
          db.select().from(bookmarkTags).where(
            and(
              eq(bookmarkTags.bookmarkId, bookmarks.id),
              eq(bookmarkTags.tagId, tagId)
            )
          )
        )
      ),
      with: {
        bookmarkTags: {
          with: {
            tag: true
          }
        }
      },
      orderBy: [desc(bookmarks.createdAt)]
    })

    // 转换数据格式，提取标签ID
    return foundBookmarks.map(bookmark => ({
      ...bookmark,
      tags: bookmark.bookmarkTags.map(bt => bt.tag.id)
    }))
  } catch (e) {
    console.error("Failed to get bookmarks by tag:", e)
    return []
  }
}

export const getBookmarkTags = async (bookmarkId: string) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const foundTags = await db
      .select()
      .from(bookmarkTags)
      .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
      .where(eq(bookmarkTags.bookmarkId, bookmarkId))
      .orderBy(desc(bookmarkTags.createdAt))

    return foundTags.map(bt => bt.tag.id)
  } catch (e) {
    console.error("Failed to get bookmark tags:", e)
    return []
  }
}

export const updateBookmark = async (userId: string, bookmarkId: string, bookmark: BookmarkFormData): Promise<ActionResponse> => {
  try {
    // 检查书签是否存在且属于当前用户
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: (bookmarks, { and, eq }) => and(
        eq(bookmarks.id, bookmarkId),
        eq(bookmarks.userId, userId)
      ),
      columns: {
        id: true,
      },
    })

    if (!existingBookmark) {
      return {
        success: false,
        message: "Bookmark not found",
        error: {
          code: "BOOKMARK_NOT_FOUND",
          details: "The bookmark you are trying to update does not exist"
        }
      }
    }

    // 检查是否已存在相同URL的书签（基于用户ID，排除当前书签）
    const duplicateBookmark = await db.query.bookmarks.findFirst({
      where: (bookmarks, { and, eq, ne }) => and(
        eq(bookmarks.url, bookmark.url),
        eq(bookmarks.userId, userId),
        ne(bookmarks.id, bookmarkId)
      ),
      columns: {
        id: true,
      },
    })

    if (duplicateBookmark) {
      return {
        success: false,
        message: "Bookmark already exists",
        error: {
          code: "DUPLICATE_BOOKMARK",
          details: "A bookmark with this URL already exists"
        }
      }
    }

    // 更新书签
    await db.update(bookmarks)
      .set({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        updatedAt: new Date(),
      })
      .where(eq(bookmarks.id, bookmarkId))

    // 更新书签和标签的关联
    // 1. 删除旧的关联
    await db.delete(bookmarkTags)
      .where(eq(bookmarkTags.bookmarkId, bookmarkId))

    // 2. 创建新的关联
    if (bookmark.tags.length > 0) {
      await db.insert(bookmarkTags).values(
        bookmark.tags.map(tagId => ({
          bookmarkId,
          tagId,
        }))
      )
    }

    revalidatePath('/')

    return {
      success: true,
      message: 'Bookmark updated successfully!'
    }
  } catch (e) {
    console.error("Failed to update bookmark:", e)
    return {
      success: false,
      message: 'Failed to update bookmark',
      error: {
        code: "DATABASE_ERROR",
        details: e instanceof Error ? e.message : "Unknown error occurred"
      }
    }
  }
}

export const incrementBookmarkClickCount = async (bookmarkId: string): Promise<ActionResponse> => {
  try {
    // 查找书签
    const bookmark = await db.query.bookmarks.findFirst({
      where: eq(bookmarks.id, bookmarkId),
      columns: {
        id: true,
        clickCount: true,
      },
    })

    if (!bookmark) {
      return {
        success: false,
        message: "Bookmark not found",
        error: {
          code: "BOOKMARK_NOT_FOUND",
          details: "The bookmark you are trying to update does not exist"
        }
      }
    }

    // 更新点击次数
    await db.update(bookmarks)
      .set({
        clickCount: (bookmark.clickCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(bookmarks.id, bookmarkId))

    return {
      success: true,
      message: 'Bookmark click count updated successfully'
    }
  } catch (e) {
    console.error("Failed to increment bookmark click count:", e)
    return {
      success: false,
      message: 'Failed to update bookmark click count',
      error: {
        code: "DATABASE_ERROR",
        details: e instanceof Error ? e.message : "Unknown error occurred"
      }
    }
  }
}

export const getMostClickedBookmarks = async (limit: number = 3) => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const mostClickedBookmarks = await db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, session.user.id),
      orderBy: [desc(bookmarks.clickCount)],
      limit: limit,
    })

    return mostClickedBookmarks
  } catch (e) {
    console.error("Failed to get most clicked bookmarks:", e)
    return []
  }
}

export const deleteBookmark = async (userId: string, bookmarkId: string): Promise<ActionResponse> => {
  try {
    // 检查书签是否存在且属于当前用户
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: (bookmarks, { and, eq }) => and(
        eq(bookmarks.id, bookmarkId),
        eq(bookmarks.userId, userId)
      ),
      columns: {
        id: true,
      },
    })

    if (!existingBookmark) {
      return await createErrorResponse(
        ErrorCode.BOOKMARK_NOT_FOUND,
        "Bookmark not found",
        "The bookmark you are trying to delete does not exist or you don't have permission to delete it"
      )
    }

    // 首先删除书签和标签的关联
    await db.delete(bookmarkTags)
      .where(eq(bookmarkTags.bookmarkId, bookmarkId))

    // 然后删除书签
    await db.delete(bookmarks)
      .where(eq(bookmarks.id, bookmarkId))

    return await createSuccessResponse(
      undefined,
      'Bookmark deleted successfully!',
      ['/']
    )
  } catch (e) {
    console.error("Failed to delete bookmark:", e)
    return await createErrorResponse(
      ErrorCode.DATABASE_ERROR,
      "Failed to delete bookmark",
      e instanceof Error ? e.message : "Unknown error occurred"
    )
  }
}
