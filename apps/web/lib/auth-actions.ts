"use server"

import { db } from "drizzle"
import { users } from "drizzle/schema"
import { eq } from "drizzle"
import { signIn } from "@/auth"
import bcrypt from "bcryptjs"
import { LoginFormData, RegisterFormData } from "./zod-schema"

type AuthResponse = {
  success: boolean
  message: string
  error?: {
    code: string
    details?: string
  }
}



export async function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
      columns: {
        id: true,
      },
    })

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
        error: {
          code: "USER_EXISTS",
          details: "A user with this email already exists"
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    await db.insert(users).values({
      email: data.email,
      password: hashedPassword,
    })

    return {
      success: true,
      message: "Registration successful",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "Registration failed",
      error: {
        code: "REGISTRATION_ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}

export async function loginWithCredentials(data: LoginFormData): Promise<AuthResponse> {
  try {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    })

    if (!result?.ok) {
      return {
        success: false,
        message: "Invalid email or password",
        error: {
          code: "INVALID_CREDENTIALS",
          details: "The email or password you entered is incorrect"
        }
      }
    }

    return {
      success: true,
      message: "Login successful",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "Login failed",
      error: {
        code: "LOGIN_ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
} 