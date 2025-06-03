import { NextResponse } from "next/server"
import { db, eq, sql } from "@packages/drizzle"
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

    // 批量更新书签点击次数
    const updatePromises = bookmarkIds.map(async (bookmarkId: string) => {
      try {
        // 先查找书签确保存在
        const bookmark = await db.query.bookmarks.findFirst({
          where: eq(bookmarks.id, bookmarkId),
          columns: {
            id: true,
            clickCount: true,
          },
        })

        if (!bookmark) {
          console.warn(`Bookmark with id ${bookmarkId} not found`)
          return { bookmarkId, success: false, error: "Bookmark not found" }
        }

        // 更新点击次数
        await db.update(bookmarks)
          .set({
            clickCount: sql`${bookmarks.clickCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(bookmarks.id, bookmarkId))

        return { bookmarkId, success: true }
      } catch (error) {
        console.error(`Error updating bookmark ${bookmarkId}:`, error)
        return { bookmarkId, success: false, error: "Update failed" }
      }
    })

    // 等待所有更新完成
    const results = await Promise.allSettled(updatePromises)
    
    // 统计结果
    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length
    
    const failedResults = results
      .filter((result) => result.status === 'rejected' || 
               (result.status === 'fulfilled' && !result.value.success))
      .map((result) => result.status === 'fulfilled' ? result.value : { error: 'Promise rejected' })

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${successCount} out of ${bookmarkIds.length} bookmarks`,
      successCount,
      totalCount: bookmarkIds.length,
      failedResults: failedResults.length > 0 ? failedResults : undefined
    })

  } catch (error) {
    console.error("Error in batch bookmark click update:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
} 