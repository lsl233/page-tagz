import type React from "react"
import { TagButton } from "@/components/tag/tag-button"
import { LoginButton } from "@/components/login/login-button"
import { auth } from "@/auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getUserTags } from "@/lib/actions"
import { TagNavItem } from "@/components/tag/tag-nav-item";


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
            <TagNavItem key={tag.id} tag={tag} />
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
