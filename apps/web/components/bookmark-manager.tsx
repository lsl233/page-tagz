"use client"

import { useState } from "react"
import { BookmarkList } from "@/components/bookmark-list"
import { BookmarkSidebar } from "@/components/bookmark-sidebar"
import { RightSidebar } from "@/components/right-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, List, Search } from "lucide-react"

export function BookmarkManager() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <BookmarkSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden border-l border-r">
        <header className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-semibold">All Bookmarks</h1>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bookmarks, URLs or tags..." className="pl-9 pr-4" />
          </div>
        </div>
{/* 
        <div className="p-4 flex gap-2 border-b">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="px-2 py-1 gap-1">
              {filter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div> */}

        <div className="flex-1 overflow-auto">
          <BookmarkList viewMode={viewMode} />
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
