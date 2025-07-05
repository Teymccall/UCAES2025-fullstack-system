"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/auth-service'
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{
    success: boolean
    error?: string
    user?: User
  }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Save user to storage (both localStorage and cookies)
const saveUserToStorage = (user: User) => {
  localStorage.setItem('academic_affairs_user', JSON.stringify(user))
  Cookies.set('academic_affairs_user', JSON.stringify(user), { expires: 7 }) // Expires in 7 days
}

// Get user from storage (prefer localStorage, fall back to cookies)
const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null
  
  const localUser = localStorage.getItem('academic_affairs_user')
  if (localUser) return JSON.parse(localUser)
  
  const cookieUser = Cookies.get('academic_affairs_user')
  return cookieUser ? JSON.parse(cookieUser) : null
}

// Remove user from storage
const removeUserFromStorage = () => {
  localStorage.removeItem('academic_affairs_user')
  Cookies.remove('academic_affairs_user')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from storage on component mount
  useEffect(() => {
    const storedUser = getUserFromStorage()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  // Compute isAuthenticated based on user state
  const isAuthenticated = !!user;

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    try {
      // Use the API route instead of direct MongoDB call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const result = await response.json();
      
      if (result.success && result.user) {
        setUser(result.user)
        saveUserToStorage(result.user)
        return { success: true, user: result.user }
      } else {
        return {
          success: false,
          error: result.error || "Invalid username or password. Please check your credentials and try again."
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      return {
        success: false,
        error: "Login failed. Please try again later."
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    removeUserFromStorage()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
