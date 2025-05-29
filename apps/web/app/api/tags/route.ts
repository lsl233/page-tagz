import { NextResponse, NextRequest } from "next/server"
import { and, db, eq, ne } from "drizzle"
import { tags } from "drizzle/schema"
import { auth, signOut } from "@/auth"
import { z } from "zod"

// 验证请求数据的 schema
const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // 1. 验证用户身份
    const session = await auth()
    console.log('Session:', session)

    if (!session?.user?.id) {
      console.log('No user ID in session')
      await signOut()
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    }

    // 2. 验证请求数据
    const body = await request.json()
    const validatedData = tagSchema.parse(body)

    console.log('Creating tag with user ID:', session.user.id)

    // 3. 检查标签名是否已存在
    const existingTag = await db.query.tags.findFirst({
      where: and(eq(tags.name, validatedData.name), eq(tags.userId, session.user.id)),
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 400 }
      )
    }

    // 4. 创建标签
    const tag = await db.insert(tags).values({
      ...validatedData,
      userId: session.user.id
    })

    // 5. 返回创建的标签
    return NextResponse.json(tag)
  } catch (error) {
    // 处理验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    // 处理其他错误
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // 1. 验证用户身份
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. 验证请求数据
    const body = await request.json()
    const { id, ...updateData } = tagSchema.extend({ id: z.string() }).parse(body)

    // 3. 检查标签名是否已存在（排除当前标签）
    const existingTag = await db.query.tags.findFirst({
      where: and(eq(tags.name, updateData.name), eq(tags.userId, session.user.id), ne(tags.id, id)),
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 400 }
      )
    }

    // 4. 更新标签（只能更新自己创建的标签）
    const tag = await db.update(tags).set(updateData).where(and(eq(tags.id, id), eq(tags.userId, session.user.id)))

    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating tag:', error)
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. 验证用户身份
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. 获取要删除的标签 ID
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      )
    }

    // 3. 删除标签（只能删除自己创建的标签）
    await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, session.user.id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allTags = await db.select().from(tags).where(eq(tags.userId, session.user.id))
  return NextResponse.json(allTags)
}

