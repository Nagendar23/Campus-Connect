"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { api, User, getAccessToken, clearTokens } from "@/lib/api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: "student" | "organizer") => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: { name?: string; email?: string; phone?: string; avatarUrl?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const refreshUser = async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await api.me()
      setUser(userData)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch user:", err)
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await api.login({ email, password })
      setUser(result.user)
    } catch (err: any) {
      setError(err.message || "Login failed")
      throw err
    }
  }

  const signup = async (name: string, email: string, password: string, role: "student" | "organizer") => {
    try {
      setError(null)
      const result = await api.signup({ name, email, password, role })
      setUser(result.user)
    } catch (err: any) {
      setError(err.message || "Signup failed")
      throw err
    }
  }

  const logout = async () => {
    try {
      // Try to logout from backend, but don't fail if it errors
      await api.logout()
    } catch (err) {
      // Silently handle logout errors - we'll clear tokens anyway
      console.warn("Backend logout failed, clearing local tokens:", err)
    }
    
    // Always clear local state and redirect
    setUser(null)
    clearTokens()
    router.push("/auth/login")
  }

  const updateProfile = async (data: { name?: string; email?: string; phone?: string; avatarUrl?: string }) => {
    if (!user) return
    
    try {
      setError(null)
      await api.updateUser(user._id, data)
      await refreshUser()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, refreshUser, updateProfile }}>
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
