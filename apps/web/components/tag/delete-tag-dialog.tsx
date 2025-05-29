import { type tags, type bookmarkTags } from "@packages/drizzle/schema"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import { useSession } from "next-auth/react"
import { deleteTag } from "@/lib/actions"
import { useTagContext } from "@/contexts/tag-context"

interface DeleteTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag: typeof tags.$inferSelect & {
    bookmarkTags: typeof bookmarkTags.$inferSelect[]
  }
}

export function DeleteTagDialog({ open, onOpenChange, tag }: DeleteTagDialogProps) {
  const session = useSession()
  const { removeTag } = useTagContext()

  const handleDelete = async () => {
    const userId = session.data?.user?.id
    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to perform this action"
      }
    }
    
    // 发送服务器请求
    const response = await deleteTag(userId, tag.id)

    // 立即执行乐观更新
    removeTag(tag.id)
    
    // 关闭删除对话框
    onOpenChange(false)
    
    return response
  }

  return (
    <DeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Are you sure?"
      description={`This action cannot be undone. This will permanently delete the tag "${tag.name}".`}
      onDelete={handleDelete}
    />
  )
} 