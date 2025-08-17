"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { RouteGuard } from "@/components/route-guard"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/components/auth-context"

export default function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [isNavigating, setIsNavigating] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

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

  return (
    <div className="min-h-screen bg-background">
      {/* Route transition loading bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-blue-600 animate-pulse">
            <div className="h-full bg-blue-400 animate-ping" style={{ width: '30%' }}></div>
          </div>
        </div>
      )}
      
      <Navbar />
      <div className="flex">
        <Sidebar userRole={user?.role as any || "director"} userPermissions={user?.permissions || []} />
        <main className="flex-1 p-6 ml-80">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
