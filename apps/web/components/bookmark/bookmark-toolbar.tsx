"use client"

import { SearchBar } from "@/components/bookmark/search-bar"
import { GalleryVerticalEnd, IndentDecrease } from "lucide-react"
import { Button } from "../ui/button-loading"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { useTagContext } from "@/contexts/tag-context"
import { useUIContext } from "@/contexts/ui-context"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { recordBookmarkClicksBatchEfficient } from "@/lib/api"

export function BookmarkToolbar() {
  const { filteredBookmarks } = useTagContext()
  const {
    leftSidebarCollapsed,
    rightSidebarCollapsed,
    toggleLeftSidebar,
    toggleRightSidebar
  } = useUIContext()
  const [extensionLoaded, setExtensionLoaded] = useState(false)

  useEffect(() => {
    console.log('bookmark toolbar mounted')
    const listener = (event: MessageEvent) => {
      if (event.data.type === 'CONTENT_SCRIPT_LOADED') {
        setExtensionLoaded(true)
      }
    }
    window.addEventListener('message', listener)

    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])

  const sendOpenAllBookmarksMessage = async () => {
    window.postMessage({
      type: 'OPEN_ALL_BOOKMARKS',
      data: filteredBookmarks.map(bookmark => bookmark.url)
    }, '*')

    // 批量更新点击次数
    try {
      const bookmarkIds = filteredBookmarks.map(bookmark => bookmark.id)
      const result = await recordBookmarkClicksBatchEfficient(bookmarkIds)

      console.log(`Updated click counts for ${result.updatedCount} bookmarks`)

      if (result.updatedCount !== result.requestedCount) {
        toast.warning(`Only ${result.updatedCount} out of ${result.requestedCount} bookmarks were updated`)
      }
    } catch (error) {
      console.error("Failed to update bookmark click counts:", error)
      // 不显示错误给用户，因为这不影响核心功能
    }
  }

  const handleOpenAllBookmarks = () => {
    if (!extensionLoaded) {
      toast.warning("Please install the extension first", {
        action: {
          label: "Install",
          onClick: () => {
            window.open("https://chromewebstore.google.com/detail/pagetagz/jodahbeeakklmdmjajjgfgocibpmkipe", "_blank")
          }
        }
      })
      return
    }

    if (filteredBookmarks.length > 10) {
      toast.warning("Too many bookmarks", {
        description: `Are you sure you want to open ${filteredBookmarks.length} bookmarks?`,
        action: {
          label: "Open",
          onClick: () => sendOpenAllBookmarksMessage(),
        },
      })
    } else {
      sendOpenAllBookmarksMessage()
    }
  }

  const handleToggleLeftSidebar = () => {
    toggleLeftSidebar()
  }

  const handleToggleRightSidebar = () => {
    toggleRightSidebar()
  }

  return (
    <div className="p-4 flex  gap-2 justify-between border-b">
      <div className="flex flex-1 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleLeftSidebar}
            >
              <IndentDecrease className={cn(leftSidebarCollapsed ? 'rotate-180' : '')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Left Sidebar</p>
          </TooltipContent>
        </Tooltip>
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenAllBookmarks}
              disabled={filteredBookmarks.length === 0}
            >
              <GalleryVerticalEnd />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open All Bookmarks in New Tab</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleRightSidebar}
            >
              <IndentDecrease className={cn(rightSidebarCollapsed ? '' : 'rotate-180')} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Right Sidebar</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
} 