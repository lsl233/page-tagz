"use client"

import type React from "react"
import { BookmarkItem } from "@/components/bookmark/bookmark-list-item"
import { useTagContext } from "@/contexts/tag-context"
import { FaCircleNotch } from "react-icons/fa6";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner"
import { deleteBookmark } from "@/lib/actions"

type BookmarkListProps = {
  viewMode: "grid" | "list"
}

export function BookmarkList({ viewMode }: BookmarkListProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { 
    filteredBookmarks, 
    isLoading, 
    userTags, 
    removeBookmark, 
    fetchBookmarks,
    searchQuery,
    searchResults
  } = useTagContext()

  // 根据是否有搜索查询来决定显示的书签列表
  const displayedBookmarks = searchQuery.trim() !== "" ? searchResults : filteredBookmarks

  const handleDelete = async (id: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to delete a bookmark")
      return { success: false, message: "Authentication required" }
    }

    try {
      // 后台执行删除操作
      const response = await deleteBookmark(user.id, id)

      if (response.success) {
        // 保存要删除的书签的引用（以便出错时可以恢复）
        const bookmarkToDelete = filteredBookmarks.find(b => b.id === id)
        if (!bookmarkToDelete) {
          return { success: false, message: "Bookmark not found" }
        }

        // 乐观更新：立即从 UI 中移除书签
        removeBookmark(id)
        // 已经通过乐观更新移除了书签，设置 silent 来避免额外 toast
        return response
      } else {
        // 删除失败，恢复 UI 状态
        toast.error(response.message)
        // 重新获取数据以恢复正确的 UI 状态
        // fetchBookmarks()
        return response
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error)
      toast.error("Failed to delete bookmark")
      // 重新获取数据以恢复 UI 状态
      fetchBookmarks()
      return { success: false, message: "An error occurred while deleting the bookmark" }
    }
  }

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
        {displayedBookmarks.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            {searchQuery.trim() !== "" 
              ? "没有找到匹配的书签" 
              : userTags.length > 0 
                ? "请添加书签以开始使用" 
                : "请创建标签以开始使用"}
          </div>
        ) : (
          displayedBookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              {...bookmark}
              viewMode={viewMode}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </>
  )
}
