"use client"

import { useState } from "react"
import { TagDialog } from "@/components/tag/tag-dialog"
import { Button } from "@/components/ui/button-loading"

export const TagButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TagDialog 
        open={open} 
        onOpenChange={setOpen}
        isEditing={false}
      />
      <Button size="icon" variant="link" className="underline-none h-auto w-auto px-2.5" onClick={() => setOpen(true)}>
        <span className="text-lg">+</span>
      </Button>
    </>
  )
}