"use client"

import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "@packages/ui/components/button-loading"
import { Input } from "@packages/ui/components/input"
import { Combobox } from "@packages/ui/components/combobox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@packages/ui/components/form"
import { useEffect, useState } from "react"
import { bookmarkSchemaResolver, type BookmarkFormData } from "@packages/utils/zod-schema"
import type { Tag } from "@packages/types"
import { toast } from "@packages/ui/components/sonner"
import { safeFetch } from "@packages/utils/safe-fetch"

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
    icon: "",
    tags: [],
  }

  const form = useForm<BookmarkFormData>({
    resolver: bookmarkSchemaResolver,
    defaultValues: Object.assign({}, defaultValues, initialData),
  })

  const handleSubmit: SubmitHandler<BookmarkFormData> = async (data) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookmarks?userId=${userId}`, {
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

  const handleCreateTag = async (name: string) => {
    const result = await safeFetch<Tag>(`${import.meta.env.VITE_API_URL}/api/tags/user-tags/${userId}?name=${name}`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    })

    if (!result.success) {
      toast.error(result.message || 'Failed to create tag')
      return
    }

    if (result.data) {
      setUserTags([result.data, ...userTags])
      form.setValue('tags', [...form.getValues('tags'), result.data.id])
    }
  }

  useEffect(() => {
    async function fetchUserTags() {
      if (!userId) return

      setIsLoadingTags(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tags/user-tags/${userId}`)
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
              <FormLabel className="text-sm">URL</FormLabel>
              <FormControl>
                <div className="flex relative items-center gap-2">
                  <div className="absolute left-2 bg-gray-100 rounded-lg w-6 h-6 flex justify-center items-center">
                    <img src={initialData?.icon} className="w-[1em] h-[1em]" />
                  </div>
                  <Input
                    className="pl-10"
                    placeholder="https://example.com"
                    type="url"
                    {...field}
                    disabled={isSubmitting || isSubmittingProp}
                  />
                </div>
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
              <FormLabel className="text-sm">Title</FormLabel>
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
        {/* 
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
        /> */}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Tags</FormLabel>
              <FormControl>
                <Combobox
                  value={field.value}
                  onChange={field.onChange}
                  onCreate={handleCreateTag}
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