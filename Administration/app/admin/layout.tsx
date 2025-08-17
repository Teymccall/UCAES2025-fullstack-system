"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopBar } from "@/components/admin/admin-top-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    
    // If not loading and no user, redirect to login
    if (!loading && !user && isClient) {
      router.push('/login')
    }
  }, [loading, user, router, isClient])
  
  // Show loading state
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-700" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If no user and not loading, don't render content (will redirect)
  if (!user) {
    return null
  }
  
  // Render admin layout if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopBar />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
 