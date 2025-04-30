"use client"

import React from "react"
import { Favicon } from "@/components/ui/favicon"
import { recordBookmarkClick } from "@/lib/api"

type BookmarkProps = {
  id: string
  url: string
  title: string
  icon: string | null
  clickCount: number | null
}

export function RightSidebarBookmarks({ bookmarks }: { bookmarks: BookmarkProps[] }) {
  if (bookmarks.length === 0) return null
  
  return (
    <section className="mb-6">
      <h3 className="text-sm font-medium mb-3">Frequently Used</h3>
      <div className="space-y-3">
        {bookmarks.map((bookmark) => (
          <a 
            key={bookmark.id} 
            href={bookmark.url} 
            target="_blank"
            rel="noopener noreferrer" 
            className="flex items-center gap-3"
            onClick={() => recordBookmarkClick(bookmark.id)}
          >
            <div className="h-8 w-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
              <Favicon url={bookmark.url} icon={bookmark.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium line-clamp-1">{bookmark.title}</div>
              <div className="text-xs text-muted-foreground">{bookmark.clickCount || 0} visits</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
} 