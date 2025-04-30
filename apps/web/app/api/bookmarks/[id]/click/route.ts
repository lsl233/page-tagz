import { NextResponse } from "next/server"
import { incrementBookmarkClickCount } from "@/lib/actions"

export async function POST(
  request: Request,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const params = await segmentData.params
    const bookmarkId = params.id
    
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