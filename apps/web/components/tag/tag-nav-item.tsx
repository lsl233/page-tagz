"use client"

import { FiMoreVertical } from "react-icons/fi";
import { FaHashtag } from "react-icons/fa6";

import { tags } from "drizzle/schema";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TagDialog } from "@/components/tag/tag-dialog";
import { useSession } from "next-auth/react";
import { deleteTag } from "@/lib/actions";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useTagContext } from "@/contexts/tag-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TagNavItem({ tag }: { tag: typeof tags.$inferSelect }) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const session = useSession();
  const { selectedTagId, setSelectedTagId, removeTag } = useTagContext();

  const handleDelete = async () => {
    const userId = session.data?.user?.id;
    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to perform this action"
      };
    }
    
    // 发送服务器请求
    const response = await deleteTag(userId, tag.id);

    // 立即执行乐观更新
    removeTag(tag.id);
    
    // 关闭删除对话框
    setDeleteOpen(false);
    
    return response;
  };

  const handleTagClick = () => {
    setSelectedTagId(tag.id);
  };

  return (
    <>
      <TagDialog 
        open={open} 
        onOpenChange={setOpen} 
        isEditing={true}
        initialData={{
          id: tag.id,
          name: tag.name,
          description: tag.description || ""
        }}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are you sure?"
        description={`This action cannot be undone. This will permanently delete the tag "${tag.name}".`}
        onDelete={handleDelete}
      />
      <li 
        key={tag.name} 
        className={cn(
          "flex rounded-md text-sm items-center gap-1 w-full justify-start pl-2 pr-1 py-1.5 h-auto cursor-pointer hover:bg-accent",
          selectedTagId === tag.id && "bg-gray-100"
        )}
        onClick={handleTagClick}
      >
        <FaHashtag className="w-4 h-4" />
        <span className="flex-1 text-left">{tag.name}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="p-0 h-auto w-auto">
              <FiMoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setOpen(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </>
  )
}