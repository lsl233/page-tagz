import { NextResponse } from "next/server"
import { prisma } from "database"

export async function GET(request: Request) {
  const tags = await prisma.tag.findMany()
  return NextResponse.json(tags)
}

export async function POST(request: Request) {
  const { name, description } = await request.json()
  const tag = await prisma.tag.create({ data: { name, description } })
  return NextResponse.json(tag)
}
