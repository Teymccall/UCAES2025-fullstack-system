"use client"

import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isClient, setIsClient] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { student, isAuthenticated, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    setIsClient(true)
    
    // Redirect unauthenticated users to login (except if already on login page)
    if (isClient && !isAuthenticated && !isLoginPage) {
      router.push('/login')
    }
  }, [isClient, isAuthenticated, isLoginPage, router])

  // Handle route transitions
  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleComplete = () => setIsNavigating(false)

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart)
    
    // Use a timeout to simulate route completion
    const timeout = setTimeout(handleComplete, 500)
    
    return () => {
      window.removeEventListener('beforeunload', handleStart)
      clearTimeout(timeout)
    }
  }, [pathname])

  const handleLogout = async () => {
    try {
      logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // If on login page, use a different layout without sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // If not authenticated and not on login page, show nothing while redirecting
  if (!isAuthenticated && !isLoginPage) {
    return null
  }

  // Regular layout without sidebar for authenticated pages
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Route transition loading bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-green-600 animate-pulse">
            <div className="h-full bg-green-400 animate-ping" style={{ width: '30%' }}></div>
          </div>
        </div>
      )}
      
      <div className="w-full">
        {/* Header with buttons */}
        {isClient && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm print:hidden">
            <div className="flex items-center">
              {pathname !== '/' ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => router.back()}
                >
                  ← Back
                </Button>
              ) : (
                <Link href="/" className="flex items-center gap-3">
                  <div className="h-12 w-12 md:h-14 md:w-14 relative">
                    <Image
                      src="/logo.png"
                      alt="UCAES Logo"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23166534' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 10v6M2 10l10-5 10 5-10 5z'/%3E%3Cpath d='M6 12v5c0 2 2 3 6 3s6-1 6-3v-5'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <span className="font-bold text-green-800 text-sm md:text-base hidden sm:inline">
                    University College of Agriculture and Environmental Studies
                  </span>
                  <span className="font-bold text-green-800 text-base sm:hidden">
                    UCAES
                  </span>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                onClick={handleLogout}
              >
                <span className="text-xs">Logout</span>
              </Button>
            </div>
          </div>
        )}
        
        <main className="p-0">
          {children}
        </main>
      </div>
    </div>
  )
}
