import { NextResponse } from "next/server"
import { db, eq, and } from "@packages/drizzle"
import { bookmarks, bookmarkTags, tags } from "@packages/drizzle/schema"

// 定义类型
type Tag = typeof tags.$inferSelect
type BookmarkTag = typeof bookmarkTags.$inferSelect & {
  tag: Tag
}
type Bookmark = typeof bookmarks.$inferSelect & {
  bookmarkTags: BookmarkTag[]
}

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const userId = searchParams.get("userId")

    if (!url || !userId) {
      return new NextResponse("URL and userId are required", { status: 400 })
    }

    // 查询书签和关联的标签
    const bookmark = await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.url, url),
        eq(bookmarks.userId, userId)
      ),
      with: {
        bookmarkTags: {
          with: {
            tag: true
          }
        }
      }
    }) as Bookmark | null

    if (!bookmark) {
      return new NextResponse("Bookmark not found", { status: 404 })
    }

    // 转换数据结构，将 bookmarkTags 转换为 tags 数组
    const transformedBookmark = {
      ...bookmark,
      tags: bookmark.bookmarkTags.map(bt => bt.tag.id)
    }

    return NextResponse.json(transformedBookmark)

  } catch (error) {
    console.error("[BOOKMARK_CHECK]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 