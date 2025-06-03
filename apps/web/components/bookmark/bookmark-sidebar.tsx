"use client"

import type React from "react"
import { TagButton } from "@/components/tag/tag-button"
import { LoginButton } from "@/components/login/login-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { TagNavItem } from "@/components/tag/tag-nav-item";
import { useTagContext } from "@/contexts/tag-context"
import { useSession, signOut } from "next-auth/react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { FiMoreVertical } from "react-icons/fi"

export function BookmarkSidebar() {
  const { userTags } = useTagContext()
  const session = useSession()

  const userInfo = session?.data?.user

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="w-full h-full flex-shrink-0 bg-background flex flex-col">
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
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <Avatar className="flex-shrink-0 bg-gray-100 rounded-lg">
                <AvatarImage src={userInfo?.image ?? ""} />
                <AvatarFallback>
                  {userInfo?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">{userInfo?.email}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mr-2">
                  <FiMoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  )
}
