import { bookmarks, tags } from "@packages/drizzle/schema"

// Tag 类型
export type Tag = typeof tags.$inferSelect

export type TagWithBookmarkCount = Tag & {
  bookmarkCount: number
}


// Bookmark 类型
export type Bookmark = typeof bookmarks.$inferSelect

export type BookmarkWithTagsId = Bookmark & {
  tags: string[]
}

export type BookmarkWithTags = Bookmark & {
  tags: Tag[]
}