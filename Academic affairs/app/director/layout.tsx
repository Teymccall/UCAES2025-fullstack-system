import type React from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { RouteGuard } from "@/components/route-guard"

export default function DirectorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requiredRole="director">
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar userRole="director" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
