"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { type Session } from "@/auth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: Session["user"] | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  githubLogin: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Extract user from session if available, ensuring id is always a string
  const user = session?.user && session.user.id 
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
      } 
    : null
  
  const isAuthenticated = !!user

  // 处理加载状态
  useEffect(() => {
    setIsLoading(status === "loading")
  }, [status])

  // 处理用户数据持久化
  useEffect(() => {
    if (user) {
      localStorage.setItem(process.env.NEXT_PUBLIC_LOCAL_STORAGE_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(process.env.NEXT_PUBLIC_LOCAL_STORAGE_USER_KEY)
    }
  }, [user])

  // Email/password login
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }
      
      toast.success("Successfully logged in")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  // Github login
  const githubLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("github", { 
        redirect: false
      })
      console.log(result, 'result')
      if (result?.error) {
        toast.error("An error occurred during GitHub login")
        setIsLoading(false)
      } else {
        // router.refresh()
        window.location.href = result?.url || "/";
        // toast.success("Successfully logged in with GitHub")
      }
    } catch (error) {
      console.error("GitHub login error:", error)
      toast.error("An error occurred during GitHub login")
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      toast.success("Successfully logged out")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("An error occurred during logout")
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh user session data
  const refreshUser = async () => {
    setIsLoading(true)
    try {
      await update({ force: true })
    } catch (error) {
      console.error("Error refreshing user session:", error)
      toast.error("Failed to refresh user data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        githubLogin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
