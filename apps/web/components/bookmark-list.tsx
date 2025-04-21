import type React from "react"
import { Github, FileText, NetworkIcon as Netflix, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BookmarkItem = {
  id: string
  title: string
  description: string
  url: string
  icon: React.ReactNode
  iconBg: string
  tags: string[]
  date: string
}

type BookmarkListProps = {
  viewMode: "grid" | "list"
}

export function BookmarkList({ viewMode }: BookmarkListProps) {
  const bookmarks: BookmarkItem[] = [
    {
      id: "1",
      title: "GitHub – 全球最大的代码托管平台",
      description: "GitHub 是世界上最大的代码托管平台，超过 5000 万开发者在此协作开发项目",
      url: "https://github.com",
      icon: <Github className="h-5 w-5 text-black" />,
      iconBg: "bg-blue-100",
      tags: ["前端开发"],
      date: "2025-04-12 添加",
    },
    {
      id: "2",
      title: "React 官方文档 – 用于构建用户界面的 JavaScript 库",
      description: "React 是一个用于构建用户界面的 JavaScript 库，让你可以创建复杂的 UI，并且易于维护",
      url: "https://reactjs.org",
      icon: <div className="h-5 w-5 flex items-center justify-center text-blue-600">⚛</div>,
      iconBg: "bg-blue-100",
      tags: ["前端开发"],
      date: "2025-04-10 添加",
    },
    {
      id: "3",
      title: "MDN Web 文档 – Web 技术权威参考",
      description: "developer.mozilla.org · 04-08",
      url: "https://developer.mozilla.org",
      icon: <FileText className="h-5 w-5 text-green-600" />,
      iconBg: "bg-green-100",
      tags: ["前端开发", "学习资源"],
      date: "",
    },
    {
      id: "4",
      title: "Netflix – 在线流媒体平台",
      description: "Netflix 是全球领先的流媒体服务，提供各种获奖电影、电视剧、动画和纪录片",
      url: "https://netflix.com",
      icon: <Netflix className="h-5 w-5 text-red-600" />,
      iconBg: "bg-purple-100",
      tags: ["影视娱乐"],
      date: "2025-04-05 添加",
    },
    {
      id: "5",
      title: "JD.com – Online Shopping Made Easy",
      description:
        "JD.com is a leading e-commerce platform offering electronics, digital products, computers and thousands of other items",
      url: "https://jd.com",
      icon: <ShoppingBag className="h-5 w-5 text-red-600" />,
      iconBg: "bg-red-100",
      tags: [],
      date: "",
    },
  ]

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
          : "flex flex-col"
      }
    >
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className={cn(
            "border rounded-lg overflow-hidden hover:shadow-xs transition-shadow",
            viewMode === "grid" ? "" : "mb-4 mx-4"
          )}
        >
          <div className="p-3 flex gap-3 items-center ">
            <div className={`${bookmark.iconBg} h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
              {bookmark.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-1">{bookmark.title}</h3>
              <div className="text-xs text-muted-foreground">{bookmark.url}</div>
              {/* {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.slice(0, 1).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {bookmark.tags.length > 1 && (
                    <span className="text-xs text-muted-foreground">+{bookmark.tags.length - 1}</span>
                  )}
                </div>
              )} */}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
