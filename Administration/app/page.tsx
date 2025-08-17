"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/admin")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-48 w-48 relative">
          <Image
            src="/uces.png"
            alt="UCAES Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center">University College of Agriculture and Environmental Studies</h1>
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
