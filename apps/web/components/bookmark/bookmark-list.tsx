"use client"

import type React from "react"
import { BookmarkItem } from "@/components/bookmark/bookmark-list-item"
import { useTagContext } from "@/contexts/tag-context"
import { FaCircleNotch } from "react-icons/fa6";
import { useAuth } from "@/contexts/auth-context";

type BookmarkListProps = {
  viewMode: "grid" | "list"
}

export function BookmarkList({ viewMode }: BookmarkListProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { filteredBookmarks, isLoading, userTags } = useTagContext()

  // if (!selectedTagId) {
  //   return null
  // }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <FaCircleNotch className="animate-spin text-muted-foreground" size={24} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="col-span-full text-center p-8 text-muted-foreground">
        Please login to view your bookmarks
      </div>
    )
  }

  return (
    <>
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
            : "flex flex-col"
        }
      >
        {filteredBookmarks.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            {userTags.length > 0 ? "Please add a bookmark to get started" : "Please create a tag to get started"}
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
    </>
  )
}
