"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"
import type { Student } from "@/lib/firebase-utils"

export const useStudent = () => {
  const { student: authStudent, loading: authLoading } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      setStudent(authStudent)
      setLoading(false)
      if (!authStudent) {
        setError("Student data not available")
      }
    }
  }, [authStudent, authLoading])

  const refetch = () => {
    // This would trigger a re-fetch in a real implementation
    setLoading(true)
    // The auth hook will handle the actual refetching
  }

  return { student, loading, error, refetch }
}
