"use client"

import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@packages/ui/components/button-loading"
import { Input } from "@packages/ui/components/input"
import { Textarea } from "@packages/ui/components/textarea"
import { Combobox } from "@packages/ui/components/combobox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@packages/ui/components/form"
import { useEffect, useState } from "react"
import { bookmarkSchema, type BookmarkFormData } from "@packages/utils/zod-schema"
import type { Tag } from "@packages/types"
import { toast } from "@packages/ui/components/sonner"

interface BookmarkFormProps {
  onSubmit: SubmitHandler<BookmarkFormData>
  isEditing: boolean
  isSubmitting: boolean
  initialData?: BookmarkFormData
  userId: string
}

export function BookmarkForm({
  onSubmit: onSubmitProp,
  isEditing,
  isSubmitting: isSubmittingProp,
  initialData,
  userId
}: BookmarkFormProps) {
  const [userTags, setUserTags] = useState<Tag[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: BookmarkFormData = {
    title: "",
    url: "",
    description: "",
    tags: [],
  }

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: Object.assign({}, defaultValues, initialData)
  })

  const handleSubmit: SubmitHandler<BookmarkFormData> = async (data) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`http://localhost:3001/api/bookmarks?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create bookmark')
      }

      const result = await response.json()
      console.log('Bookmark created:', result)
      
      // 调用父组件的 onSubmit
      onSubmitProp(data)
      toast.success('Bookmark submitted successfully')
      
    } catch (error) {
      console.error('Error creating bookmark:', error)
      // 这里可以添加错误提示
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function fetchUserTags() {
      if (!userId) return
      
      setIsLoadingTags(true)
      try {
        const response = await fetch(`http://localhost:3001/api/tags/user-tags/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch tags')
        }
        const data = await response.json()
        setUserTags(data.tags)
      } catch (error) {
        console.error('Error fetching user tags:', error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchUserTags()
  }, [userId])

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  return (
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
                  disabled={isSubmitting || isSubmittingProp}
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
                  disabled={isSubmitting || isSubmittingProp}
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
                  className="h-24"
                  {...field}
                  disabled={isSubmitting || isSubmittingProp}
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
                  disabled={isSubmitting || isLoadingTags}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="">
          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting || isSubmittingProp}
            loading={isSubmitting || isSubmittingProp}
          >
            {isEditing ? "Save changes" : "Add bookmark"}
          </Button>
        </div>
      </form>
    </Form>
  )
}