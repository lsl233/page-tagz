"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { RightSidebarActions } from "@/components/right-sidebar-actions"
import { getUserTags, getMostClickedBookmarks } from "@/lib/actions"
import { RightSidebarBookmarks } from "@/components/right-sidebar-bookmarks"
import { Skeleton } from "@/components/ui/skeleton"
import type { TagWithBookmarkCount } from "@packages/types"

type Bookmark = {
  id: string
  title: string
  url: string
  description: string | null
  icon: string | null
  clickCount: number
  createdAt: Date
  updatedAt: Date
}

export function RightSidebar() {
  const [frequentBookmarks, setFrequentBookmarks] = useState<Bookmark[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(true)
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行获取数据
        const [bookmarksData] = await Promise.all([
          getMostClickedBookmarks(3)
        ])
        
        setFrequentBookmarks(bookmarksData)
      } catch (error) {
        console.error("Error fetching right sidebar data:", error)
      } finally {
        setIsLoadingTags(false)
        setIsLoadingBookmarks(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="w-full h-full flex-shrink-0 bg-background flex flex-col">
      {/* Actions Section */}
      <RightSidebarActions />

      {/* Bookmarks Section */}
      <div className="flex-1 overflow-auto p-4">
        {isLoadingBookmarks ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <RightSidebarBookmarks bookmarks={frequentBookmarks} />
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex justify-between items-center">
        {/* <button className="text-xs text-muted-foreground hover:text-foreground">
          Dark Mode
        </button> */}
        <div className="text-xs text-muted-foreground text-center w-full">© 2025 PageTagz v1.0.0</div>
      </div>
    </div>
  )
}
