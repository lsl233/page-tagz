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
import { createTagFormSchema, CreateTagForm } from "@/lib/zod-schema"
import { createTag, updateTag as updateTagAction, type ActionResponse } from "@/lib/actions"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useTagContext } from "@/contexts/tag-context"

type TagDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing?: boolean
  onSubmitSuccess?: (data: CreateTagForm) => void
  initialData?: CreateTagForm & { id?: string }
}

export function TagDialog({ open, onOpenChange, isEditing = false, onSubmitSuccess, initialData }: TagDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { updateTag, addTag } = useTagContext()

  const defaultValues: CreateTagForm = {
    name: "",
    description: ""
  }

  const form = useForm<CreateTagForm>({
    resolver: zodResolver(createTagFormSchema),
    defaultValues: initialData || defaultValues,
  })

  const handleSubmit: SubmitHandler<CreateTagForm> = async (data) => {
    const userId = user?.id
    if (!userId) {
      toast.error("You must be logged in to perform this action")
      return
    }

    try {
      setIsSubmitting(true)
      let response: ActionResponse
      if (isEditing && initialData?.id) {
        response = await updateTagAction(userId, initialData.id, data)
        if (response.success && response.data) {
          updateTag(initialData.id, response.data)
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
      } else {
        response = await createTag(userId, data)
        if (response.success && response.data) {
          addTag(response.data)
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
      }
    } catch (e) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    form.clearErrors()
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