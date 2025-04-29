import { NextResponse } from "next/server"
import { getBookmarkTags } from "@/lib/actions"
import { auth } from "@/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await getBookmarkTags(params.id)
    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching bookmark tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 