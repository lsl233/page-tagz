"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { bookmarks, tags } from "drizzle/schema"
import { getUserTags } from "@/lib/actions"
import { fetchBookmarksByTag } from "@/lib/api"
import { toast } from "sonner"

type Bookmark = typeof bookmarks.$inferSelect

type Tag = typeof tags.$inferSelect

type TagContextType = {
  selectedTagId: string | null
  setSelectedTagId: (tagId: string | null) => void
  filteredBookmarks: Bookmark[]
  setFilteredBookmarks: (bookmarks: Bookmark[]) => void
  userTags: Tag[]
  fetchBookmarks: () => Promise<void>
  removeBookmark: (bookmarkId: string) => void
  isLoading: boolean
}

const TagContext = createContext<TagContextType | undefined>(undefined)

export function TagProvider({ children }: { children: ReactNode }) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [userTags, setUserTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBookmarks = async () => {
    if (selectedTagId) {
      setIsLoading(true)
      try {
        const bookmarks = await fetchBookmarksByTag(selectedTagId)
        console.log("bookmarks", bookmarks)
        setFilteredBookmarks(bookmarks)
      } catch (error) {
        console.error("Error fetching bookmarks:", error)
        toast.error("Failed to load bookmarks")
      } finally {
        setIsLoading(false)
      }
    } else {
      setFilteredBookmarks([])
    }
  }

  useEffect(() => {
    const initializeTags = async () => {
      const tags = await getUserTags()
      setUserTags(tags)
      if (tags.length > 0) {
        setSelectedTagId(tags[0].id)
      }
      setIsLoading(false)
    }
    initializeTags()
  }, [])

  useEffect(() => {
    if (selectedTagId) {
      fetchBookmarks()
    } else {
      // setIsLoading(false)
    }
  }, [selectedTagId])

  // 用于乐观更新的删除书签方法
  const removeBookmark = (bookmarkId: string) => {
    setFilteredBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
  }

  return (
    <TagContext.Provider value={{ 
      selectedTagId, 
      setSelectedTagId, 
      filteredBookmarks, 
      setFilteredBookmarks, 
      userTags,
      fetchBookmarks,
      removeBookmark,
      isLoading
    }}>
      {children}
    </TagContext.Provider>
  )
}

export function useTagContext() {
  const context = useContext(TagContext)
  if (context === undefined) {
    throw new Error("useTagContext must be used within a TagProvider")
  }
  return context
} 