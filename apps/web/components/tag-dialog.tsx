"use client"

import type React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
})

export type TagFormData = z.infer<typeof tagSchema>

type TagDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing?: boolean
  onSubmit?: (data: TagFormData) => void
  initialData?: TagFormData
}

export function TagDialog({ open, onOpenChange, isEditing = false, onSubmit, initialData }: TagDialogProps) {
  const defaultValues: TagFormData = {
    name: "",
    description: "",
    color: "#000000",
  }

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: initialData || defaultValues,
  })

  const handleSubmit: SubmitHandler<TagFormData> = (data) => {
    onSubmit?.(data)
    handleClose()
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Tag" : "Add Tag"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Tag name" 
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      ref={ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description" 
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value || ""}
                      ref={ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input 
                        type="color"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || "#000000"}
                        ref={ref}
                        className="w-9 h-9 p-1 cursor-pointer shrink-0"
                      />
                    </FormControl>
                    <FormControl>
                      <Input 
                        disabled
                        type="text"
                        placeholder="#000000"
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value || "#000000"}
                        ref={ref}
                        className="font-mono"
                        maxLength={7}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save changes" : "Add tag"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 