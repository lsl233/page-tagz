import { NextResponse } from "next/server"
import { db, eq } from "@packages/drizzle"
import { tags } from "@packages/drizzle/schema"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    // 查询指定用户创建的所有标签
    const userTags = await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(tags.createdAt)

    return NextResponse.json({
      tags: userTags,
    })

  } catch (error) {
    console.error("[TAGS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 