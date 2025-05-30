import { NextResponse } from "next/server"
import { getBookmarksByTag } from "@/lib/actions"
import { auth } from "@/auth"
import { db } from "@packages/drizzle"
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
    const { title, url, description, tags } = validatedData

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
      // 创建书签和标签的关联
      await db.insert(bookmarkTags).values(
        tags.map(tagId => ({
          bookmarkId: newBookmark.id,
          tagId,
        }))
      )
    }

    return NextResponse.json(newBookmark)

  } catch (error) {
    console.error("[BOOKMARKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 