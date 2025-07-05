"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  studentId: string
  role: "student"
}

interface AuthContextType {
  user: User | null
  login: (studentId: string, dateOfBirth: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("ucaes_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("ucaes_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (studentId: string, dateOfBirth: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock validation - in real app, validate against Firebase/API
      const validCredentials = [
        { studentId: "AG/2021/001234", dateOfBirth: "2000-01-15", name: "John Doe", email: "john.doe@ucaes.edu.gh" },
        {
          studentId: "AG/2021/001235",
          dateOfBirth: "2001-03-22",
          name: "Jane Smith",
          email: "jane.smith@ucaes.edu.gh",
        },
        {
          studentId: "AG/2021/001236",
          dateOfBirth: "1999-12-10",
          name: "Mike Johnson",
          email: "mike.johnson@ucaes.edu.gh",
        },
      ]

      const validUser = validCredentials.find(
        (cred) => cred.studentId === studentId && cred.dateOfBirth === dateOfBirth,
      )

      if (validUser) {
        const userData: User = {
          id: validUser.studentId,
          name: validUser.name,
          email: validUser.email,
          studentId: validUser.studentId,
          role: "student",
        }

        setUser(userData)
        localStorage.setItem("ucaes_user", JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ucaes_user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
