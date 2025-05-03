"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button-loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signIn } from "next-auth/react"
import { SiGithub } from "react-icons/si"
import { toast } from "sonner"
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/zod-schema"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useAuthActions } from "@/hooks/use-auth-actions"
import { cn } from "@/lib/utils"

// Extended schema with confirmPassword for the form
const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string(),
})

// Type for the form data
type RegisterFormValues = z.infer<typeof registerFormSchema>

type LoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [isLoggingInWithGithub, setIsLoggingInWithGithub] = useState(false)
  const router = useRouter()
  const { refreshUser, githubLogin } = useAuth()
  const { login, register, isLoading } = useAuthActions()

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerFormSchema),
  })

  // Reset forms when switching between login and register
  useEffect(() => {
    if (isRegister) {
      loginForm.reset()
    } else {
      registerForm.reset()
    }
  }, [isRegister, loginForm, registerForm])

  const handleClose = () => {
    loginForm.reset()
    registerForm.reset()
    onOpenChange(false)
  }

  const handleLoginSubmit = async (data: LoginFormData) => {
    const success = await login(data)
    await refreshUser()
    if (success) {
      handleClose()
    }
  }

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    // Remove confirmPassword from data
    const { confirmPassword, ...registerData } = data

    const success = await register(registerData)
    if (success) {
      handleClose()
    }
  }

  const handleGithubLogin = async () => {
    setIsLoggingInWithGithub(true)
    try {
      await githubLogin()
      await refreshUser()
      router.refresh()
      handleClose()
    } catch (error) {
      console.error("GitHub login error:", error)
      toast.error("GitHub login failed")
    } finally {
      setIsLoggingInWithGithub(false)
    }
  }

  const switchToRegister = () => {
    setIsRegister(true)
  }

  const switchToLogin = () => {
    setIsRegister(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
      modal={true}
    >
      <DialogContent
        className="sm:max-w-[400px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isRegister ? "Create Account" : "Login to Your Account"}</DialogTitle>
        </DialogHeader>
        <div className="">
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className={cn("space-y-4", "w-full", "shrink-0", {
              "hidden": !isRegister,
              "block": isRegister,
            })}>
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email, {field.value}</FormLabel>
                    <FormControl>

                      <Input placeholder="your@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password, {field.value}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} new-password="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password, {field.value}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} new-password="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button type="submit" className="w-full" loading={isLoading}>
                  Create Account
                </Button>
                <div className="text-center text-sm">
                  Already have an account?
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm ml-1"
                    type="button"
                    onClick={switchToLogin}
                  >
                    Login
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className={cn("space-y-4", "w-full", "shrink-0", {
              "hidden": isRegister,
              "block": !isRegister,
            })}>
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} current-password="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <div className="flex-1 text-right">
                  <Button variant="link" className="p-0 h-auto text-sm" type="button">
                    Forgot password?
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button type="submit" className="w-full" loading={isLoading}>
                  Login
                </Button>
                <Button onClick={handleGithubLogin} loading={isLoggingInWithGithub} type="button" className="w-full" variant="outline">
                  <SiGithub className="w-4 h-4 mr-2" />
                  Login with GitHub
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm ml-1"
                    type="button"
                    onClick={switchToRegister}
                  >
                    Register
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </div>

      </DialogContent>
    </Dialog>
  )
}
