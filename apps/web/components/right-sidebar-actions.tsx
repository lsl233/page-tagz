"use client"

import type React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookmarkDialog } from "@/components/bookmark/bookmark-dialog"
import { type BookmarkFormData } from "@/lib/zod-schema"
import { createBookmark } from "@/lib/actions"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useTagContext } from "@/contexts/tag-context"

export function RightSidebarActions() {
  const { data: session } = useSession()
  const { userTags } = useTagContext()
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentBookmark, setCurrentBookmark] = useState<BookmarkFormData | undefined>(undefined)

  const handleBookmarkSubmit = async (data: BookmarkFormData) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a bookmark")
      return
    }

    const response = await createBookmark(session.user.id, data)
    
    return response
  }

  const addNewBookmark = () => {
    setIsEditing(false)
    setCurrentBookmark(undefined)
    setBookmarkDialogOpen(true)
  }

  return (
    <div className="p-4 flex justify-center">
      <Button className="w-full gap-2" variant="default" onClick={addNewBookmark}>
        <Plus className="h-4 w-4" /> Add Bookmark
      </Button>

      <BookmarkDialog
        availableTags={userTags}
        open={bookmarkDialogOpen}
        onOpenChange={setBookmarkDialogOpen}
        isEditing={isEditing}
        onSubmit={handleBookmarkSubmit}
        initialData={currentBookmark}
      />
    </div>
  )
} 