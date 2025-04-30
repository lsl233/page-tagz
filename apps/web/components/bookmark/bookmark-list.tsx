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
  const { selectedTagId, filteredBookmarks, setFilteredBookmarks } = useTagContext()

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (selectedTagId) {
        try {
          const bookmarks = await fetchBookmarksByTag(selectedTagId)
          setFilteredBookmarks(bookmarks)
        } catch (error) {
          console.error("Error fetching bookmarks:", error)
          toast.error("Failed to load bookmarks")
        }
      } else {
        setFilteredBookmarks([])
      }
    }
    
    fetchBookmarks()
  }, [selectedTagId, setFilteredBookmarks])

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
          : "flex flex-col"
      }
    >
      {filteredBookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          {...bookmark}
          viewMode={viewMode}
        />
      ))}
    </div>
  )
}
