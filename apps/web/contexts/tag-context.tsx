"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { bookmarks, tags } from "drizzle/schema"
import { getUserTags } from "@/lib/actions"

type Bookmark = typeof bookmarks.$inferSelect

type Tag = typeof tags.$inferSelect

type TagContextType = {
  selectedTagId: string | null
  setSelectedTagId: (tagId: string | null) => void
  filteredBookmarks: Bookmark[]
  setFilteredBookmarks: (bookmarks: Bookmark[]) => void
  userTags: Tag[]
}

const TagContext = createContext<TagContextType | undefined>(undefined)

export function TagProvider({ children }: { children: ReactNode }) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [userTags, setUserTags] = useState<Tag[]>([])

  useEffect(() => {
    const initializeTags = async () => {
      const tags = await getUserTags()
      setUserTags(tags)
      if (tags.length > 0) {
        setSelectedTagId(tags[0].id)
      }
    }
    initializeTags()
  }, [])

  return (
    <TagContext.Provider value={{ selectedTagId, setSelectedTagId, filteredBookmarks, setFilteredBookmarks, userTags }}>
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