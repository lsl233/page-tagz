"use client"

import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button-loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { bookmarkSchema, type BookmarkFormData } from "@packages/utils/zod-schema"
import { useTagContext } from "@/contexts/tag-context"
import { ActionResponse } from "@/lib/actions"
import { Bookmark } from "@packages/types"

type BookmarkDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  onSubmit?: (data: BookmarkFormData) => Promise<any>
  onSuccess?: (data: BookmarkFormData) => void
  initialData?: BookmarkFormData & { id?: string }
  availableTags?: { id: string; name: string }[]
}

export function BookmarkDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing,
  onSubmit,
  initialData,
  availableTags = []
}: BookmarkDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addBookmark, updateBookmark, selectedTagId, userTags } = useTagContext()

  const defaultValues: BookmarkFormData & { id?: string } = {
    title: "",
    url: "",
    description: "",
    tags: !isEditing && selectedTagId ? [selectedTagId] : [],
  }

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: Object.assign({}, defaultValues, initialData)
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  // 当 dialog 打开时，如果是新建模式且有选中的标签，则添加到表单
  useEffect(() => {
    if (open && !isEditing && selectedTagId && !initialData) {
      form.setValue('tags', [selectedTagId])
    }
  }, [open, selectedTagId, isEditing, form, initialData])

  // 处理创建书签的乐观更新
  const handleCreateSuccess = (response: ActionResponse, data: BookmarkFormData) => {
    if (response?.success && response?.data) {
      addBookmark(response.data, data.tags)
      toast.success(response.message || "Bookmark created successfully")
      handleClose()
      onSuccess?.(data)
    }
  }

  // 处理更新书签的乐观更新
  const handleUpdateSuccess = (response: ActionResponse, data: BookmarkFormData) => {
    console.log(initialData)
    if (response?.success && initialData && initialData.id) {
      // 获取旧的标签列表
      const newTags = data.tags
      // 使用当前书签ID和新数据进行乐观更新
      updateBookmark(initialData.id, {
        ...data,
        tags: newTags
      }, newTags)

      toast.success(response.message || "Bookmark updated successfully")
      handleClose()
      onSuccess?.(data)
    }
  }

  // 处理错误情况
  const handleError = (response?: ActionResponse, error?: unknown) => {
    if (response) {
      toast.error(response.message || "Failed to save bookmark")
    } else {
      toast.error("Something went wrong. Please try again.")
      console.error("Error submitting bookmark:", error)
    }
  }

  const handleSubmit: SubmitHandler<BookmarkFormData> = async (data) => {
    if (!onSubmit) return
    try {
      setIsSubmitting(true)
      const response = await onSubmit(data)

      if (!response?.success) {
        handleError(response)
        return
      }

      if (isEditing) {
        handleUpdateSuccess(response, data)
      } else {
        handleCreateSuccess(response, data)
      }
    } catch (error) {
      handleError(undefined, error)
    } finally {
      setIsSubmitting(false)
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
          <DialogTitle>{isEditing ? "Edit Bookmark" : "Add Bookmark"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      type="url"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bookmark title"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Combobox
                      value={field.value}
                      onChange={field.onChange}
                      options={userTags}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isEditing ? "Save changes" : "Add bookmark"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
