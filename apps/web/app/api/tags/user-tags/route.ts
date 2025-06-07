import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db, eq, and } from "@packages/drizzle"
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

export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id

    // 解析请求体
    const body = await request.json()
    const { name, description } = body

    // 验证必需字段
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new NextResponse("Tag name is required", { status: 400 })
    }

    const trimmedName = name.trim()

    // 检查标签名长度
    if (trimmedName.length > 50) {
      return new NextResponse("Tag name cannot exceed 50 characters", { status: 400 })
    }

    // 检查描述长度
    if (description && typeof description === 'string' && description.length > 200) {
      return new NextResponse("Description cannot exceed 200 characters", { status: 400 })
    }

    // 检查是否已存在相同名称的标签
    const existingTag = await db
      .select()
      .from(tags)
      .where(and(eq(tags.userId, userId), eq(tags.name, trimmedName)))
      .limit(1)

    if (existingTag.length > 0) {
      return new NextResponse("Tag with this name already exists", { status: 409 })
    }

    // 创建新标签
    const newTag = await db
      .insert(tags)
      .values({
        name: trimmedName,
        description: description || null,
        userId: userId,
      })
      .returning()

    return NextResponse.json(newTag[0])

  } catch (error) {
    console.error("[TAGS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 