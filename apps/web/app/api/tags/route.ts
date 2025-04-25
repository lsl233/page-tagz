import { NextResponse, NextRequest } from "next/server"
import { prisma } from "database"
import { auth, signOut } from "@/auth"
import { z } from "zod"

// 验证请求数据的 schema
const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  description: z.string().optional(),
})

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 获取当前用户创建的所有标签
    const tags = await prisma.tag.findMany({
      where: {
        creatorId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    )
  }
}

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
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: validatedData.name,
        creatorId: session.user.id
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 400 }
      )
    }

    // 4. 创建标签
    const tag = await prisma.tag.create({
      data: {
        ...validatedData,
        creatorId: session.user.id
      }
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
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: updateData.name,
        creatorId: session.user.id,
        NOT: {
          id: id
        }
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag name already exists" },
        { status: 400 }
      )
    }

    // 4. 更新标签（只能更新自己创建的标签）
    const tag = await prisma.tag.update({
      where: {
        id,
        creatorId: session.user.id // 确保只能更新自己的标签
      },
      data: updateData
    })

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
    await prisma.tag.delete({
      where: {
        id,
        creatorId: session.user.id // 确保只能删除自己的标签
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    )
  }
}


