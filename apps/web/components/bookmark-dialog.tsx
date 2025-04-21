"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BookmarkDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  onSubmit?: (data: BookmarkFormData) => void
  initialData?: BookmarkFormData
}

export type BookmarkFormData = {
  title: string
  url: string
  description: string
  category: string
}

export function BookmarkDialog({ open, onOpenChange, isEditing, onSubmit, initialData }: BookmarkDialogProps) {
  const defaultData: BookmarkFormData = {
    title: "",
    url: "",
    description: "",
    category: "frontend",
  }

  const data = initialData || defaultData

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const bookmarkData: BookmarkFormData = {
      title: formData.get("title") as string,
      url: formData.get("url") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
    }

    onSubmit?.(bookmarkData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bookmark" : "Add Bookmark"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={data.title} placeholder="Bookmark title" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                defaultValue={data.url}
                placeholder="https://example.com"
                type="url"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={data.description}
                placeholder="Brief description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue={data.category} name="category">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend Dev</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="recipes">Recipes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{isEditing ? "Save changes" : "Add bookmark"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
