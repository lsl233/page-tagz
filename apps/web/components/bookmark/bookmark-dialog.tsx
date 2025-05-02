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
import { bookmarkSchema, type BookmarkFormData } from "@/lib/zod-schema"
import { useTagContext } from "@/contexts/tag-context"

type BookmarkDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  onSubmit?: (data: BookmarkFormData) => Promise<any>
  onSuccess?: (data: BookmarkFormData) => void
  initialData?: BookmarkFormData
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
  const { addBookmark } = useTagContext()

  const defaultValues: BookmarkFormData = {
    title: "",
    url: "",
    description: "",
    tags: [],
  }

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: initialData || defaultValues,
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const handleSubmit: SubmitHandler<BookmarkFormData> = async (data) => {
    if (!onSubmit) return

    try {
      setIsSubmitting(true)
      // 调用提交函数并等待响应
      const response = await onSubmit(data)
      
      // 如果创建书签成功且收到了服务器返回的数据
      if (response?.success && response?.data && !isEditing) {
        // 使用服务器返回的数据进行乐观更新
        addBookmark(response.data, data.tags)
        
        // 已经进行了乐观更新，服务器消息会通过 toast 显示
        toast.success(response.message || "Bookmark created successfully")
      } else if (response?.success && isEditing) {
        // 更新操作不使用乐观更新，而是通过重新获取数据来更新
        toast.success(response.message || "Bookmark updated successfully")
      } else if (!response?.success) {
        // 处理错误情况
        toast.error(response?.message || "Failed to save bookmark")
      }
      
      onSuccess?.(data)
      handleClose()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error("Error submitting bookmark:", error)
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
                      options={availableTags}
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
