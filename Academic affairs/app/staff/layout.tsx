import type React from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { RouteGuard } from "@/components/route-guard"

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requiredRole="staff">
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar userRole="staff" />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  )
}
