import type React from "react"
import { FolderIcon, ShoppingBag, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TagButton } from "@/components/tag/tag-button"
import { LoginButton } from "@/components/login/login-button"
import { auth } from "@/auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getUserTags } from "@/lib/actions"

type TagItem = {
  name: string
  icon: React.ReactNode
  count: number
  active?: boolean
}

export async function BookmarkSidebar() {
  const session = await auth()

  const userInfo = session?.user

  const userTags = userInfo?.id ? await getUserTags(userInfo.id) : []

  return (
    <div className="w-[210px] flex-shrink-0 bg-muted flex flex-col">
      <div className="p-2">
        <h2 className="font-semibold text-lg">Tags</h2>
      </div>
      <div className="px-2 py-1">
        <TagButton />
      </div>
      <div className="flex-1 overflow-auto">
        <ul className="py-2">
          {userTags.map((tag) => (
            <li key={tag.name}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-4 py-2 h-auto",
                  // tag.active && "bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                <span className="flex items-center gap-2 w-full">
                  {/* {tag.icon} */}
                  <span className="flex-1 text-left">{tag.name}</span>
                  {/* <span className="text-xs text-muted-foreground">{tag}</span> */}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-2 border-t">
        {userInfo ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>
                {session.user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm text-muted-foreground">{session.user?.name}</span>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  )
}
