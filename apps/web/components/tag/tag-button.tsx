"use client"

import { useState } from "react"
import { TagDialog } from "@/components/tag/tag-dialog"
import { Button } from "@/components/ui/button-loading"

export const TagButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TagDialog open={open} onSubmitSuccess={() => setOpen(false)} onOpenChange={setOpen}></TagDialog>
      <Button onClick={() => setOpen(true)} className="w-full gap-2" variant="outline">
        <span className="text-lg">+</span> New Tag
      </Button>
    </>
  )
}