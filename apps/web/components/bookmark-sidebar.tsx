import type React from "react"
import { FolderIcon, ShoppingBag, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TagButton } from "@/components/tag-button"

type TagItem = {
  name: string
  icon: React.ReactNode
  count: number
  active?: boolean
}

export function BookmarkSidebar() {
  const tags: TagItem[] = [
    {
      name: "All Bookmarks",
      icon: <FolderIcon className="h-4 w-4 text-blue-600" />,
      count: 128,
      active: true,
    },
    {
      name: "Frontend Dev",
      icon: (
        <div className="h-4 w-4 bg-blue-100 rounded flex items-center justify-center">
          <span className="text-xs text-blue-600">F</span>
        </div>
      ),
      count: 42,
    },
    {
      name: "Learning",
      icon: (
        <div className="h-4 w-4 bg-green-100 rounded flex items-center justify-center">
          <span className="text-xs text-green-600">L</span>
        </div>
      ),
      count: 36,
    },
    {
      name: "Entertainment",
      icon: (
        <div className="h-4 w-4 bg-purple-100 rounded flex items-center justify-center">
          <span className="text-xs text-purple-600">E</span>
        </div>
      ),
      count: 24,
    },
    {
      name: "Shopping",
      icon: <ShoppingBag className="h-4 w-4 text-red-600" />,
      count: 18,
    },
    {
      name: "Recipes",
      icon: <Utensils className="h-4 w-4 text-yellow-600" />,
      count: 8,
    },
  ]



  return (
    <div className="w-[210px] flex-shrink-0 bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">My Tags</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <ul className="py-2">
          {tags.map((tag) => (
            <li key={tag.name}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-4 py-2 h-auto",
                  tag.active && "bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                <span className="flex items-center gap-2 w-full">
                  {tag.icon}
                  <span className="flex-1 text-left">{tag.name}</span>
                  <span className="text-xs text-muted-foreground">{tag.count}</span>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-2 border-t">
        <TagButton />
      </div>
    </div>
  )
}
