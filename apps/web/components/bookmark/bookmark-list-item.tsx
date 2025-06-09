"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { recordBookmarkClick, fetchBookmarkTags } from "@/lib/api"
import { FiMoreVertical } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { useState, useEffect, memo } from "react"
import { BookmarkDialog } from "@/components/bookmark/bookmark-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { bookmarks } from "@packages/drizzle/schema"
import { type BookmarkFormData } from "@/lib/zod-schema"
import { toast } from "sonner"
import { useTagContext } from "@/contexts/tag-context"
import { useSession } from "next-auth/react"
import { updateBookmark } from "@/lib/actions"
import { Favicon } from "@/components/ui/favicon"


export type BookmarkItemProps = typeof bookmarks.$inferSelect & {
  viewMode: "grid" | "list"
  onDelete?: (id: string) => Promise<{ success: boolean; message: string; silent?: boolean }>
}

// 记忆化的书签图标组件
const MemoizedFaviconContainer = memo(function FaviconContainer({ 
  url, 
  icon 
}: { 
  url?: string, 
  icon?: string | null 
}) {
  return (
    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Favicon url={url} icon={icon} size={16} />
    </div>
  );
});

// 使用 React.memo 包装 BookmarkItem 组件
export const BookmarkItem = memo(function BookmarkItem({
  id,
  title,
  url,
  description,
  icon,
  viewMode,
  onDelete
}: BookmarkItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const { userTags, updateBookmark: updateBookmarkInContext } = useTagContext()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await fetchBookmarkTags(id)
        setCurrentTags(tags)
      } catch (error) {
        console.error("Error fetching bookmark tags:", error)
        toast.error("Failed to load bookmark tags")
      }
    }
    fetchTags()
  }, [id])

  const handleEdit = async (data: BookmarkFormData) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to edit a bookmark")
      return
    }

    // 保存当前状态以便进行乐观更新
    // const updatedBookmarkData = {
    //   title: data.title,
    //   url: data.url,
    //   description: data.description || null,
    // }
    
    // 立即使用乐观更新更新UI
    // updateBookmarkInContext(id, updatedBookmarkData, data.tags)
    
    // 提交到服务器
    const response = await updateBookmark(session.user.id, id, data)

    if (response.success) {
      // toast.success(response.message)
      setEditOpen(false)
      // 更新成功，本地状态已经更新，不需要再获取数据
    } else {
      // toast.error(response.message)
      // 如果更新失败，可以考虑还原UI或重新获取数据
      // fetchBookmarks()
    }
    
    return response
  }

  const handleDelete = async () => {
    if (onDelete) {
      const response = await onDelete(id)
      setDeleteOpen(false)
      return response
    }
    return Promise.resolve({ success: true, message: "Bookmark deleted successfully" })
  }

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    try {
      await recordBookmarkClick(id)
    } catch (error) {
      console.error("Error setting up click tracking:", error)
    }
  }

  return (
    <>
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are you sure?"
        description={`This action cannot be undone. This will permanently delete the bookmark "${title}".`}
        onDelete={handleDelete}
      />
      <div
        className={cn(
          "border rounded-lg overflow-hidden hover:shadow-xs transition-shadow",
          viewMode === "grid" ? "" : "mb-4 mx-4"
        )}
      >
        <div className="p-3 flex gap-2 items-center">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-1 gap-3 items-center"
            onClick={handleBookmarkClick}
          >
            <MemoizedFaviconContainer url={url} icon={icon} />
            <div className="flex-1 overflow-hidden">
              <h3 className="font-medium text-sm line-clamp-1 break-all">{title}</h3>
              <div className="text-xs text-muted-foreground line-clamp-1 break-all">{url}</div>
            </div>
          </a>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 w-auto h-auto text-gray-400 hover:text-gray-800 outline-none focus:outline-none hover:bg-transparent focus:border-none flex-shrink-0">
                <FiMoreVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-1" align="end">
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  className="justify-start text-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEditOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-sm text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteOpen(true)
                  }}
                >
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <BookmarkDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            isEditing={true}
            onSubmit={handleEdit}
            availableTags={userTags}
            initialData={{
              id: id,
              title: title ?? "",
              url: url ?? "",
              description: description ?? "",
              tags: currentTags
            }}
          />
        </div>
      </div>
    </>
  )
}); 