import { NextResponse } from "next/server"
import { getBookmarksByTag } from "@/lib/actions"
import { auth } from "@/auth"

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