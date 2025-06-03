// import { useState } from "react"
import { BookmarkList } from "@/components/bookmark/bookmark-list"
import { BookmarkSidebar } from "@/components/bookmark/bookmark-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { BookmarkToolbar } from "@/components/bookmark/bookmark-toolbar"

export async function BookmarkManager() {
  // const { filteredBookmarks } = useTagContext()

  // const handleOpenAllBookmarks = () => {
  //   filteredBookmarks.forEach(bookmark => {
  //     window.open(bookmark.url, "_blank")
  //   })
  // }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <BookmarkSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden border-l border-r">
        {/* Toolbar */}
        <BookmarkToolbar />

        {/* Bookmark List */}
        <div className="flex-1 overflow-auto">
          <BookmarkList viewMode="grid" />
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
