import { NextResponse } from "next/server"
import { incrementBookmarkClickCount } from "@/lib/actions"

type RouteParams = {
  params: {
    id: string
  }
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const bookmarkId = context.params.id
    
    const result = await incrementBookmarkClickCount(bookmarkId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating bookmark click count:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 