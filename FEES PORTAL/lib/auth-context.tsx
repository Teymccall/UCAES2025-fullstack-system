"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { resolveStudentPhoto } from './photo-utils'

interface User {
  id: string
  name: string
  email: string
  studentId: string
  role: "student"
  passportPhotoUrl?: string
  profilePictureUrl?: string
  programme?: string
  currentLevel?: string
  programmeType?: 'regular' | 'weekend'
  level?: number
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

  const login = async (studentId: string, dateOfBirth: string) => {
    try {
      setLoading(true)
      // Import the authenticateStudent function here to avoid circular imports
      const { authenticateStudent } = await import('./firebase')
      
      console.log('Attempting login for fees portal:', studentId)
      
      // Use real Firebase authentication
      const studentData = await authenticateStudent(studentId, dateOfBirth)
      
      if (studentData) {
        // Determine programme type from schedule
        const scheduleType = studentData.scheduleType || "Regular"
        const programmeType: 'regular' | 'weekend' = scheduleType.toLowerCase().includes('weekend') ? 'weekend' : 'regular'
        
        // Extract numeric level from currentLevel (e.g., "Level 100" -> 100)
        const levelString = studentData.currentLevel || "Level 100"
        const level = parseInt(levelString.replace(/\D/g, '')) || 100

        // Resolve passport photo using the new utility
        const photoData = await resolveStudentPhoto(studentId, studentData)

        const userData: User = {
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          studentId: studentData.studentId,
          role: "student",
          passportPhotoUrl: photoData.url,
          profilePictureUrl: photoData.url,
          programme: studentData.programme,
          currentLevel: studentData.currentLevel,
          programmeType: programmeType,
          level: level,
        }
        
        setUser(userData)
        localStorage.setItem("ucaes_user", JSON.stringify(userData))
        console.log('Login successful for fees portal:', userData.name)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
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
