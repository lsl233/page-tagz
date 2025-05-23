"use client"

import type React from "react"
import { TagButton } from "@/components/tag/tag-button"
import { LoginButton } from "@/components/login/login-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { TagNavItem } from "@/components/tag/tag-nav-item";
import { useTagContext } from "@/contexts/tag-context"
import { useSession } from "next-auth/react"

export function BookmarkSidebar() {
  const { userTags } = useTagContext()
  const session = useSession()

  const userInfo = session?.data?.user

  return (
    <div className="w-[210px] flex-shrink-0 bg-background flex flex-col">
      <div className="p-2">
        <h2 className="font-semibold text-lg">PageTags</h2>
      </div>
      <div className="px-2 py-1">
        <TagButton />
      </div>
      <div className="flex-1 overflow-auto">
        <ul className="py-2 px-2 space-y-1">
          {userTags.map((tag) => (
            <TagNavItem key={tag.id} tag={tag} />
          ))}
        </ul>
      </div>
      <div className="p-2 border-t">
        {userInfo ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={userInfo?.image ?? ""} />
              <AvatarFallback>
                {userInfo?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm text-muted-foreground truncate flex-1">{userInfo?.email}</span>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  )
}
