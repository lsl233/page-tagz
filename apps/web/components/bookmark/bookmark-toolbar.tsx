"use client"

import { SearchBar } from "@/components/bookmark/search-bar"
import { GalleryVerticalEnd, IndentDecrease } from "lucide-react"
import { Button } from "../ui/button-loading"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { useTagContext } from "@/contexts/tag-context"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function BookmarkToolbar() {
  const { filteredBookmarks } = useTagContext()
  const [extensionLoaded, setExtensionLoaded] = useState(false)


  useEffect(() => {
    console.log('bookmark toolbar mounted')
    const listener = (event: MessageEvent) => {
      if (event.data.type === 'CONTENT_SCRIPT_LOADED_RECEIVED') {
        console.log('CONTENT_SCRIPT_LOADED_RECEIVED')
        setExtensionLoaded(true)
      }
    }
    window.addEventListener('message', listener)
    window.postMessage({type: 'CONTENT_SCRIPT_LOADED'}, '*')

    return () => {
      window.removeEventListener('message', listener)
    }

  }, [])

  const sendOpenAllBookmarksMessage = () => {
    window.postMessage({ type: 'OPEN_ALL_BOOKMARKS', data: filteredBookmarks.map(bookmark => bookmark.url) }, '*')
  }

  const handleOpenAllBookmarks = () => {
    if (filteredBookmarks.length > 10) {
      toast("Too many bookmarks", {
        description: `Is real open ${filteredBookmarks.length} bookmarks?`,
        action: {
          label: "Open",
          onClick: () => sendOpenAllBookmarksMessage(),
        },
      })
    } else {
      sendOpenAllBookmarksMessage()
    }
    // window.postMessage({ type: 'OPEN_ALL_BOOKMARKS', data: filteredBookmarks.map(bookmark => bookmark.url) }, '*')
  }

  const handleCollapseAll = () => {
    // TODO: 实现折叠所有功能
    console.log("Collapse all")
  }

  const handleExpandAll = () => {
    // TODO: 实现展开所有功能
    console.log("Expand all")
  }

  return (
    <div className="p-4 flex justify-between border-b">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleCollapseAll}>
              <IndentDecrease />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Collapse All</p>
          </TooltipContent>
        </Tooltip>
        <SearchBar />
      </div>

      <div className="flex items-center gap-2">
        {
          extensionLoaded && (
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
          )
        }

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleExpandAll}>
              <IndentDecrease className="rotate-180" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Expand All</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
} 