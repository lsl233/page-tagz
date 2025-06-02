"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { bookmarks, bookmarkTags, tags } from "@packages/drizzle/schema"
import { getUserTags } from "@/lib/actions"
import { fetchBookmarksByTag } from "@/lib/api"
import { toast } from "sonner"
import { Tag, TagWithBookmarkCount, Bookmark, BookmarkWithTagsId } from "@packages/types"

type TagContextType = {
  selectedTagId: string | null
  setSelectedTagId: (tagId: string | null) => void
  filteredBookmarks: BookmarkWithTagsId[]
  setFilteredBookmarks: (bookmarks: BookmarkWithTagsId[]) => void
  userTags: TagWithBookmarkCount[]
  fetchBookmarks: () => Promise<void>
  removeBookmark: (bookmarkId: string) => void
  addBookmark: (bookmark: BookmarkWithTagsId, tagIds?: string[]) => void
  updateBookmark: (bookmarkId: string, updatedData: Partial<BookmarkWithTagsId>, tags: string[]) => void
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: BookmarkWithTagsId[]
  updateTag: (tagId: string, updatedTag: Tag) => void
  addTag: (tag: Tag) => void
  removeTag: (tagId: string) => void
}

const TagContext = createContext<TagContextType | undefined>(undefined)

export function TagProvider({ children }: { children: ReactNode }) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkWithTagsId[]>([])
  const [userTags, setUserTags] = useState<TagWithBookmarkCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BookmarkWithTagsId[]>([])

  const fetchBookmarks = async () => {
    if (selectedTagId) {
      setIsLoading(true)
      try {
        const bookmarks = await fetchBookmarksByTag(selectedTagId)
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
      if (tags.length > 0 && selectedTagId === null) {
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

  // 处理搜索，在当前标签的书签中根据查询进行过滤
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = filteredBookmarks.filter(bookmark => 
      bookmark.title?.toLowerCase().includes(query) || 
      bookmark.url?.toLowerCase().includes(query) || 
      bookmark.description?.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, filteredBookmarks]);

  // 用于乐观更新的删除书签方法
  const removeBookmark = (bookmarkId: string) => {
    // 在删除书签前，先获取书签的标签信息
    const bookmarkToRemove = filteredBookmarks.find(b => b.id === bookmarkId);
    const tagsToUpdate = bookmarkToRemove?.tags || [];
    // 更新标签计数
    if (tagsToUpdate.length > 0) {
      setUserTags(prevTags => 
        prevTags.map(tag => {
          // 如果标签在被删除的书签中，减少计数
          if (tagsToUpdate.includes(tag.id)) {
            return {
              ...tag,
              bookmarkCount: Math.max(0, Number(tag.bookmarkCount) - 1)
            };
          }
          return tag;
        })
      );
    }
    
    // 从列表中移除书签
    setFilteredBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
  }

  // 用于乐观更新的添加书签方法
  const addBookmark = (bookmark: BookmarkWithTagsId, tagIds?: string[]) => {
    // 如果当前选中的标签ID与书签关联的标签匹配，则添加到列表
    if (selectedTagId && tagIds && tagIds.includes(selectedTagId)) {
      setFilteredBookmarks(prev => [bookmark, ...prev])
    }

    // 更新相关标签的计数
    if (tagIds && tagIds.length > 0) {
      setUserTags(prevTags => 
        prevTags.map(tag => {
          // 如果标签在新添加的书签中，增加计数
          if (tagIds.includes(tag.id)) {
            return {
              ...tag,
              bookmarkCount: Number(tag.bookmarkCount) + 1
            };
          }
          return tag;
        })
      );
    }
  }

  // 用于乐观更新编辑后的书签
  const updateBookmark = (bookmarkId: string, updatedData: Partial<BookmarkWithTagsId>, tags: string[]) => {
    try {
      // 查找现有书签在当前视图中的索引
      const existingIndex = filteredBookmarks.findIndex(b => b.id === bookmarkId);
      const exists = existingIndex !== -1;
      const oldBookmark = exists ? filteredBookmarks[existingIndex] : null;
      const oldTags = oldBookmark?.tags || [];

      

      // 计算标签变更
      const removedTags = oldTags.filter(tagId => !tags.includes(tagId));
      const addedTags = tags.filter(tagId => !oldTags.includes(tagId));

      console.log('Tag changes:', {
        bookmarkId,
        oldTags,
        newTags: tags,
        removed: removedTags,
        added: addedTags,
        selectedTagId
      });

      // 1. 检查是否移除了当前选中的标签
      const removedCurrentTag = selectedTagId && removedTags.includes(selectedTagId);
      
      if (removedCurrentTag) {
        // 如果移除了当前选中的标签，从当前视图中删除这个书签
        setFilteredBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      } else {
        // 检查书签是否应该显示在当前视图中
        const shouldIncludeInCurrentView = !selectedTagId || tags.includes(selectedTagId);
        
        if (shouldIncludeInCurrentView) {
          // 创建更新后的书签数据
          const updatedBookmark = exists 
            ? { ...filteredBookmarks[existingIndex], ...updatedData, tags }
            : { id: bookmarkId, ...updatedData, tags } as BookmarkWithTagsId;

          if (exists) {
            // 更新现有书签
            const updatedBookmarks = [...filteredBookmarks];
            updatedBookmarks[existingIndex] = updatedBookmark;
            setFilteredBookmarks(updatedBookmarks);
          } else {
            // 如果书签之前不在此视图中但现在应该显示，则添加它
            setFilteredBookmarks(prev => [updatedBookmark, ...prev]);
          }
        } else if (exists) {
          // 如果书签不应该出现在当前视图中但目前存在，则移除它
          setFilteredBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
        }
      }

      // 2. 更新标签的计数（无论书签是否在当前视图中都要更新）
      if (removedTags.length > 0 || addedTags.length > 0) {
        setUserTags(prevTags => 
          prevTags.map(tag => {
            // 标签被移除
            if (removedTags.includes(tag.id)) {
              return {
                ...tag,
                bookmarkCount: Math.max(0, Number(tag.bookmarkCount) - 1)
              };
            }
            
            // 标签被添加
            if (addedTags.includes(tag.id)) {
              return {
                ...tag,
                bookmarkCount: Number(tag.bookmarkCount) + 1
              };
            }

            // 标签未变更
            return tag;
          })
        );
      }

    } catch (error) {
      console.error("Error updating bookmark in context:", error);
    }
  }

  // 用于乐观更新标签
  const updateTag = (tagId: string, updatedTag: Partial<Tag>) => {
    console.log('updateTag', userTags, updatedTag)
    setUserTags(prev => 
      prev.map(tag => tag.id === tagId ? { ...tag, ...updatedTag } : tag)
    );
    
    // 如果更新的是当前选中的标签，可能需要更新标签名显示
    if (tagId === selectedTagId) {
      // 可能需要其他操作，比如更新页面标题等
    }
  };

  // 用于乐观更新添加标签
  const addTag = (tag: Tag) => {
    setUserTags(prev => [...prev, { ...tag, bookmarkCount: 0 }]);
    // 如果是首个标签，可以自动选中
    if (userTags.length === 0) {
      setSelectedTagId(tag.id);
    }
  };

  // 用于乐观更新删除标签
  const removeTag = (tagId: string) => {
    // 如果删除的是当前选中的标签，则需要更新选中状态
    if (tagId === selectedTagId) {
      // 过滤掉删除的标签后，选择新的标签
      setUserTags(prev => {
        const updatedTags = prev.filter(tag => tag.id !== tagId);
        
        if (updatedTags.length > 0) {
          // 如果还有其他标签，选中第一个标签
          setSelectedTagId(updatedTags[0].id);
        } else {
          // 如果没有标签了，将选中状态设为 null
          setSelectedTagId(null);
        }
        
        // 清空当前书签列表，因为选中的标签已经改变
        setFilteredBookmarks([]);
        
        return updatedTags;
      });
    } else {
      // 如果删除的不是当前选中的标签，只需要更新标签列表
      setUserTags(prev => prev.filter(tag => tag.id !== tagId));
    }
  };

  return (
    <TagContext.Provider value={{ 
      selectedTagId, 
      setSelectedTagId, 
      filteredBookmarks, 
      setFilteredBookmarks, 
      userTags,
      fetchBookmarks,
      removeBookmark,
      addBookmark,
      updateBookmark,
      isLoading,
      searchQuery,
      setSearchQuery,
      searchResults,
      updateTag,
      addTag,
      removeTag
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