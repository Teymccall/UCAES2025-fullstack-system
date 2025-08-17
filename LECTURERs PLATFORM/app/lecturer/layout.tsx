"use client";
import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LecturerSidebar } from "@/components/lecturer/sidebar"
import { TopBar } from "@/components/lecturer/top-bar"
import { SidebarHelp } from "@/components/lecturer/sidebar-help"
import AuthGuardWrapper from "@/components/AuthGuardWrapper"
import { AcademicProvider } from "@/components/academic-provider"

import { useAuth } from "@/components/auth-context"
import { inter } from "./fonts"
import "../globals.css"

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-green-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user after loading, don't render anything (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className={`${inter.className} bg-gray-50 h-screen flex`}>
      <SidebarProvider defaultOpen={false}>
        <AcademicProvider>
          <LecturerSidebar />
          <SidebarInset>
            <TopBar />
            <main className="flex-1 overflow-auto p-3 sm:p-6">
              <AuthGuardWrapper>{children}</AuthGuardWrapper>
            </main>
          </SidebarInset>
          <SidebarHelp />
        </AcademicProvider>
      </SidebarProvider>
    </div>
  )
}
