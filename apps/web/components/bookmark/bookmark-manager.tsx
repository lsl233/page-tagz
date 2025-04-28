// import { useState } from "react"
import { BookmarkList } from "@/components/bookmark/bookmark-list"
import { BookmarkSidebar } from "@/components/bookmark/bookmark-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"


export async function BookmarkManager() {
  const viewMode = "grid"

  // const tags = await fetch("http://localhost:3000/api/tags").then(res => res.json())

  // console.log(tags)
  // const [viewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <BookmarkSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden border-l border-r">

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bookmarks, URLs or tags..." className="pl-9 pr-4" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <BookmarkList viewMode={viewMode} />
        </div>
      </div>

      <RightSidebar />
    </div>
  )
}
