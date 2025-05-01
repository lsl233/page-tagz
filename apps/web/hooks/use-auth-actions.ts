"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { loginWithCredentials, registerUser } from "@/lib/auth-actions"
import { type LoginFormData, type RegisterFormData } from "@/lib/zod-schema"

/**
 * Custom hook for authentication actions with loading state management
 */
export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false)
  const { refreshUser } = useAuth()
  const router = useRouter()

  /**
   * Register a new user with email and password
   */
  const register = async (data: RegisterFormData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await registerUser(data)
      
      if (result.success) {
        toast.success(result.message)
        // Login automatically after registration
        const loginResult = await loginWithCredentials({
          email: data.email,
          password: data.password,
        })
        
        if (loginResult.success) {
          await refreshUser()
          router.refresh()
          return true
        }
        
        return false
      } else {
        toast.error(result.message)
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Login with email and password
   */
  const login = async (data: LoginFormData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await loginWithCredentials(data)
      
      if (result.success) {
        toast.success(result.message)
        await refreshUser()
        router.refresh()
        return true
      } else {
        toast.error(result.message)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh the current user's session data
   */
  const refresh = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await refreshUser()
      router.refresh()
    } catch (error) {
      console.error("Error refreshing user:", error)
      toast.error("Failed to refresh user data")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    register,
    refresh,
    isLoading
  }
} 