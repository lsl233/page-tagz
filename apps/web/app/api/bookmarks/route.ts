import { NextResponse } from "next/server"
import { getBookmarksByTag } from "@/lib/actions"
import { auth } from "@/auth"
import { db, eq } from "@packages/drizzle"
import { bookmarks, bookmarkTags } from "@packages/drizzle/schema"
import { bookmarkSchema } from "@packages/utils/zod-schema"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tagId = searchParams.get("tagId")

    console.log("tagId", tagId)

    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 })
    }

    const bookmarks = await getBookmarksByTag(tagId)
    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error("Error fetching bookmarks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    const body = await request.json()
    const validatedData = bookmarkSchema.parse(body)
    const { title, url, description, tags, id } = validatedData

    let bookmark

    if (id && typeof id === 'string') {
      // 更新现有书签
      console.log("Updating bookmark with id:", id)
      
      // 检查书签是否存在且属于当前用户
      const existingBookmark = await db.query.bookmarks.findFirst({
        where: (bookmarks, { and, eq }) => and(
          eq(bookmarks.id, id),
          eq(bookmarks.userId, userId)
        ),
      })

      if (!existingBookmark) {
        return new NextResponse("Bookmark not found", { status: 404 })
      }

      // 更新书签
      const [updatedBookmark] = await db
        .update(bookmarks)
        .set({
          title,
          url,
          description,
          updatedAt: new Date(),
        })
        .where(eq(bookmarks.id, id))
        .returning()

      // 更新书签和标签的关联
      // 1. 删除旧的关联
      await db.delete(bookmarkTags)
        .where(eq(bookmarkTags.bookmarkId, id))

      // 2. 创建新的关联
      if (tags && tags.length > 0) {
        await db.insert(bookmarkTags).values(
          tags.map(tagId => ({
            bookmarkId: id,
            tagId,
          }))
        )
      }

      bookmark = updatedBookmark
    } else {
      // 创建新书签
      console.log("Creating new bookmark")
      
      // 检查是否已存在相同URL的书签（基于用户ID）
      const existingBookmark = await db.query.bookmarks.findFirst({
        where: (bookmarks, { and, eq }) => and(
          eq(bookmarks.url, url),
          eq(bookmarks.userId, userId)
        ),
      })

      if (existingBookmark) {
        return new NextResponse("Bookmark already exists", { status: 409 })
      }

      // 创建书签
      const [newBookmark] = await db
        .insert(bookmarks)
        .values({
          title,
          url,
          description,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // 如果有标签，创建书签-标签关联
      if (tags && tags.length > 0) {
        await db.insert(bookmarkTags).values(
          tags.map(tagId => ({
            bookmarkId: newBookmark.id,
            tagId,
          }))
        )
      }

      bookmark = newBookmark
    }

    return NextResponse.json({
      success: true,
      data: bookmark,
      message: id ? 'Bookmark updated successfully' : 'Bookmark created successfully'
    })

  } catch (error) {
    console.error("[BOOKMARKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 