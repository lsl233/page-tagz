"use client"

import type React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button-loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  description: z.string().optional(),
})

export type TagFormData = z.infer<typeof tagSchema>

type TagDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing?: boolean
  onSubmitSuccess?: (data: TagFormData) => void
  initialData?: TagFormData
}

export function TagDialog({ open, onOpenChange, isEditing = false, onSubmitSuccess, initialData }: TagDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: TagFormData = {
    name: "",
    description: ""
  }

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: initialData || defaultValues,
  })

  const handleSubmit: SubmitHandler<TagFormData> = async (data) => {
    setIsSubmitting(true)
    const res = await fetch("/api/tags", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(res => res.json())
    setIsSubmitting(false)
    onSubmitSuccess?.(data)
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

            <DialogFooter>
              <Button type="button" disabled={isSubmitting} variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>{isEditing ? "Save changes" : "Add tag"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 