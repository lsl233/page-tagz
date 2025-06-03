import { NextResponse } from "next/server"
import { db, inArray, sql } from "@packages/drizzle"
import { bookmarks } from "@packages/drizzle/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookmarkIds } = body

    // 验证输入
    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return NextResponse.json(
        { error: "bookmarkIds array is required and cannot be empty" }, 
        { status: 400 }
      )
    }

    // 验证数组大小，防止过大的批量操作
    if (bookmarkIds.length > 100) {
      return NextResponse.json(
        { error: "Cannot update more than 100 bookmarks at once" }, 
        { status: 400 }
      )
    }

    // 使用单一SQL查询批量更新
    const result = await db
      .update(bookmarks)
      .set({
        clickCount: sql`${bookmarks.clickCount} + 1`,
        updatedAt: new Date(),
      })
      .where(inArray(bookmarks.id, bookmarkIds))
      .returning({ id: bookmarks.id, clickCount: bookmarks.clickCount })

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.length} bookmarks`,
      updatedCount: result.length,
      requestedCount: bookmarkIds.length,
      updatedBookmarks: result
    })

  } catch (error) {
    console.error("Error in batch bookmark click update:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
} 