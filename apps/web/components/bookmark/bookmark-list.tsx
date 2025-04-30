"use client"

import type React from "react"
import { Github, FileText, NetworkIcon as Netflix, ShoppingBag } from "lucide-react"
import { BookmarkItem } from "@/components/bookmark/bookmark-list-item"
import { useTagContext } from "@/contexts/tag-context"
import { useEffect } from "react"
import { toast } from "sonner"
import { fetchBookmarksByTag } from "@/lib/api"

type BookmarkListProps = {
  viewMode: "grid" | "list"
}

export function BookmarkList({ viewMode }: BookmarkListProps) {
  const { filteredBookmarks, isLoading } = useTagContext()

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
              : "flex flex-col"
          }
        >
          {filteredBookmarks.length === 0 ? (
            <div className="col-span-full text-center p-8 text-muted-foreground">
              No bookmarks found for this tag
            </div>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <BookmarkItem
                key={bookmark.id}
                {...bookmark}
                viewMode={viewMode}
              />
            ))
          )}
        </div>
      )}
    </>
  )
}
