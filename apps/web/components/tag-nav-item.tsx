"use client"

import { FiMoreVertical } from "react-icons/fi";
import { FaHashtag } from "react-icons/fa6";

import { tags } from "drizzle/schema";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TagDialog } from "./tag/tag-dialog";
import { useSession } from "next-auth/react";
import { deleteTag } from "@/lib/actions";
import { DeleteDialog } from "@/components/ui/delete-dialog";


export function TagNavItem({ tag }: { tag: typeof tags.$inferSelect }) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const session = useSession();

  const handleDelete = async () => {
    const userId = session.data?.user?.id;
    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to perform this action"
      };
    }

    return deleteTag(userId, tag.id);
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
      <li key={tag.name} className="flex items-center gap-1 w-full justify-start pl-2 pr-1 py-2 h-auto">
        <FaHashtag className="w-4 h-4" />
        <span className="flex-1 text-left">{tag.name}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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