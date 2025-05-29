import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, eq } from "@packages/drizzle"
import { tags } from "@packages/drizzle/schema"

export async function GET(
  request: Request,
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    // 查询用户创建的所有标签
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