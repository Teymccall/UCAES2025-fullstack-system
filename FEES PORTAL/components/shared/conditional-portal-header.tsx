"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import PortalHeader from "./portal-header"

export default function ConditionalPortalHeader() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // Don't show header on login page or when user is not authenticated
  if (loading || !user || pathname === '/login') {
    return null
  }
  
  // Determine current page for header highlighting
  let currentPage = "home"
  if (pathname.includes('/fees')) currentPage = "fees"
  if (pathname.includes('/wallet')) currentPage = "wallet"
  if (pathname.includes('/transactions')) currentPage = "transactions"
  
  return <PortalHeader currentPage={currentPage} />
}





