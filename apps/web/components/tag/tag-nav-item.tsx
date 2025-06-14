"use client"

import { FiMoreVertical } from "react-icons/fi";
import { FaHashtag } from "react-icons/fa6";
import { common } from "@packages/utils/event-handlers";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TagDialog } from "@/components/tag/tag-dialog";
import { useSession } from "next-auth/react";
import { deleteTag } from "@/lib/actions";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useTagContext } from "@/contexts/tag-context";
import { cn } from "@/lib/utils";
import { TagWithBookmarkCount } from "@packages/types";

interface TagNavItemProps {
  tag: TagWithBookmarkCount
}

export function TagNavItem({ tag }: TagNavItemProps) {
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
          "group relative flex items-center gap-1 w-full justify-start pl-2 pr-1 py-1.5 h-auto cursor-pointer hover:bg-accent rounded-md",
          selectedTagId === tag.id && "bg-gray-100"
        )}
        onClick={handleTagClick}
      >
        <FaHashtag className="w-4 h-4" />
        <span className="flex-1 text-left">{tag.name}</span>

        <div className="flex items-center gap-2">
          <span className="text-xs mr-2 text-gray-500 transition-opacity duration-200 opacity-100 group-hover:opacity-0">{tag.bookmarkCount}</span>
          <div className="absolute right-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="p-0 h-auto w-auto flex items-center justify-center">
                  <FiMoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={common.menuItemClick(() => setOpen(true))}
                >Edit</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={common.safeClick(() => setDeleteOpen(true))}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </li>
    </>
  )
}