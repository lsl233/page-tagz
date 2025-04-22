"use client"

import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signIn } from "next-auth/react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
})

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = {
  email: string
  password: string
  rememberMe: boolean
}

type RegisterFormData = {
  email: string
  username: string
  password: string
  confirmPassword: string
}

type LoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin?: (data: LoginFormData) => void
  onRegister?: (data: RegisterFormData) => void
}

export function LoginDialog({ open, onOpenChange, onLogin, onRegister }: LoginDialogProps) {
  const [isRegister, setIsRegister] = useState(false)

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerSchema),
  })

  const handleClose = () => {
    loginForm.reset()
    registerForm.reset()
    onOpenChange(false)
  }

  const handleLoginSubmit = (data: LoginFormData) => {
    onLogin?.(data)
    handleClose()
  }

  const handleRegisterSubmit = (data: RegisterFormData) => {
    onRegister?.(data)
    handleClose()
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
        {isRegister ? (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
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
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
                <div className="text-center text-sm">
                  Already have an account?
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm ml-1"
                    type="button"
                    onClick={() => setIsRegister(false)}
                  >
                    Login
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
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
                      <Input type="password" {...field} />
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
                <Button onClick={() => signIn("github")} type="submit" className="w-full">
                  Login
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm ml-1"
                    type="button"
                    onClick={() => setIsRegister(true)}
                  >
                    Register
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
