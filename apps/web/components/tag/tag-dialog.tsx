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
import { startTransition, useState } from "react"
import { createTagFormSchema, CreateTagForm } from "@/lib/zod-schema"
import { createTag } from "@/lib/actions"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type TagDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing?: boolean
  onSubmitSuccess?: (data: CreateTagForm) => void
  initialData?: CreateTagForm
}

export function TagDialog({ open, onOpenChange, isEditing = false, onSubmitSuccess, initialData }: TagDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const session = useSession()

  const defaultValues: CreateTagForm = {
    name: "",
    description: ""
  }

  const form = useForm<CreateTagForm>({
    resolver: zodResolver(createTagFormSchema),
    defaultValues: initialData || defaultValues,
  })

  const handleSubmit: SubmitHandler<CreateTagForm> = async (data) => {

    const userId = session.data?.user?.id
    if (userId) {

      startTransition(async () => {

        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        try {
          const response = await createTag(userId, {
            name: data.name,
            description: data.description,
          })
          if (response.success) {
            toast.success(response.message)
            onSubmitSuccess?.(data)
            handleClose()
          } else {
            switch (response.error?.code) {
              case "DUPLICATE_TAG":
                form.setError("name", {
                  type: "manual",
                  message: "This tag name already exists"
                })
                break
              default:
                toast.error(response.message)
            }
          }
        } catch (e) {
          toast.error("An unexpected error occurred")
        }
      });
    }
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