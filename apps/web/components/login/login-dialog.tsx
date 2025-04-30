"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button-loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signIn } from "next-auth/react"
import { SiGithub } from "react-icons/si"
import { toast } from "sonner"
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/zod-schema"
import { loginWithCredentials, registerUser } from "@/lib/auth-actions"

// Extended schema with confirmPassword for the form
const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => {
  console.log(data, 'registerFormSchema')
  return data.password === data.confirmPassword
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],  
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleClose = () => {
    loginForm.reset()
    registerForm.reset()
    onOpenChange(false)
  }

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      const result = await loginWithCredentials(data)
      
      if (result.success) {
        toast.success(result.message)
        handleClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Login failed. Please try again.")
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true)
    try {
      // Remove confirmPassword from data
      const { confirmPassword, ...registerData } = data
      
      const result = await registerUser(registerData)
      
      if (result.success) {
        toast.success(result.message)
        // Automatically log in after successful registration
        await loginWithCredentials({ 
          email: registerData.email, 
          password: registerData.password 
        })
        handleClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.")
      console.error("Registration error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGithubLogin = () => {
    setIsLoggingInWithGithub(true)
    signIn("github")
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

              {/* <FormField
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
              /> */}

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
                <Button type="submit" className="w-full" loading={isSubmitting}>
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
                <Button type="submit" className="w-full" loading={isSubmitting}>
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
