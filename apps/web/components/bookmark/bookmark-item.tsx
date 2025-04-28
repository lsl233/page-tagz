"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { FiMoreVertical } from "react-icons/fi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { useState } from "react"

export type BookmarkItemProps = {
  id: string
  title: string
  description: string
  url: string
  icon: React.ReactNode
  iconBg: string
  tags: string[]
  date: string
  viewMode: "grid" | "list"
  onDelete?: (id: string) => Promise<{ success: boolean; message: string }>
}

export function BookmarkItem({ 
  title, 
  url, 
  icon, 
  iconBg,
  viewMode,

}: BookmarkItemProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    return Promise.resolve({ success: true, message: "Bookmark deleted successfully" })
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
        <div className="p-3 flex gap-3 items-center">
          <div className={`${iconBg} h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
            <div className="text-xs text-muted-foreground line-clamp-1">{url}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-0 h-auto w-auto">
                <FiMoreVertical className="w-auto h-auto -mr-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
} 