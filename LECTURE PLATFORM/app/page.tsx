"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/lecturer")
  }, [router])

  return (
    <div className="h-screen w-full flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">UCAES Lecturer Portal</h1>
        <p className="text-green-600">Redirecting to dashboard...</p>
        <div className="mt-4">
          <div className="h-2 w-40 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-green-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 