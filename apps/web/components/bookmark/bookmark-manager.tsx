"use client"

// import { useState } from "react"
import { BookmarkList } from "@/components/bookmark/bookmark-list"
import { BookmarkSidebar } from "@/components/bookmark/bookmark-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { BookmarkToolbar } from "@/components/bookmark/bookmark-toolbar"
import { useUIContext } from "@/contexts/ui-context"
import { cn } from "@/lib/utils"

export function BookmarkManager() {
  const { leftSidebarCollapsed, rightSidebarCollapsed } = useUIContext()

  // const handleOpenAllBookmarks = () => {
  //   filteredBookmarks.forEach(bookmark => {
  //     window.open(bookmark.url, "_blank")
  //   })
  // }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        leftSidebarCollapsed ? "w-0" : "w-[210px]"
      )}>
        <BookmarkSidebar />
      </div>

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
      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        rightSidebarCollapsed ? "w-0" : "w-[250px]"
      )}>
        <RightSidebar />
      </div>
    </div>
  )
}
