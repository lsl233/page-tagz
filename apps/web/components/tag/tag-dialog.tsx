"use client"

import type React from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button-loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { createTagFormSchemaResolver, type CreateTagForm } from "@packages/utils/zod-schema"
import { createTag, updateTag as updateTagAction, type ActionResponse } from "@/lib/actions"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useTagContext } from "@/contexts/tag-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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
  const [isContinueCreateTag, setIsContinueCreateTag] = useState(false)


  const defaultValues: CreateTagForm = {
    name: "",
    description: ""
  }

  const form = useForm<CreateTagForm>({
    resolver: createTagFormSchemaResolver,
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
          const createdTag = response.data
          createdTag.bookmarkTags = []
          addTag(createdTag)
          toast.success(response.message)
          onSubmitSuccess?.(data)
          if (isContinueCreateTag) {
            form.reset()
          } else {
            handleClose()
          }
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
    setIsContinueCreateTag(false)
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
              <Button type="submit" loading={isSubmitting}>Submit</Button>

            </DialogFooter>
            {
              !isEditing && (
                <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                  <Checkbox
                    id="toggle-2"
                    checked={isContinueCreateTag}
                    onCheckedChange={(checked) => setIsContinueCreateTag(checked === "indeterminate" ? false : checked as boolean)}
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      After submit, Is continue create tag?
                    </p>
                  </div>
                </Label>
              )
            }

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 