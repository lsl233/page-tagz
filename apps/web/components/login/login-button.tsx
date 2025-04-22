"use client"

import { Button } from "@/components/ui/button"
import { LoginDialog } from "@/components/login/login-dialog"
import { useState } from "react"
import { UserIcon } from "lucide-react"

export const LoginButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        <UserIcon className="w-4 h-4" />
        Login
      </Button>
      <LoginDialog open={open} onOpenChange={setOpen} />
    </>
  )
}