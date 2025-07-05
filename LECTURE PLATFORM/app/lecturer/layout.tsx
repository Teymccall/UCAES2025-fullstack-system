import type React from "react"
import { Inter } from "next/font/google"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LecturerSidebar } from "@/components/lecturer/sidebar"
import { TopBar } from "@/components/lecturer/top-bar"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "UCAES Lecturer Portal",
  description: "University College of Agriculture and Environmental Studies - Lecturer Portal",
}

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} bg-gray-50 h-screen flex`}>
      <SidebarProvider>
        <LecturerSidebar />
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
