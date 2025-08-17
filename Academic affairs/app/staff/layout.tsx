"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { RouteGuard } from "@/components/route-guard"
import { useAuth } from "@/components/auth-context"

export default function StaffLayout({
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
    // Keep the loading bar responsive without forcing delays
    setIsNavigating(true)
    const timeout = setTimeout(() => setIsNavigating(false), 200)
    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <RouteGuard requiredRole="staff">
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
          <Sidebar userRole={user?.role as any || "staff"} userPermissions={user?.permissions || []} />
          <main className="flex-1 p-6 ml-80">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
