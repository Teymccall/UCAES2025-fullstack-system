"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: "director" | "staff"
  requiredPermissions?: string[]
}

export function RouteGuard({ children, requiredRole, requiredPermissions }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      // Check role-based access
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user?.role === "director") {
          router.push("/director/dashboard")
        } else if (user?.role === "staff") {
          router.push("/staff/dashboard")
        } else {
          router.push("/login")
        }
        return
      }

      // Check permission-based access
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(
          (permission) => user?.permissions.includes(permission) || user?.permissions.includes("full_access"),
        )

        if (!hasPermission) {
          // Redirect to dashboard if no permission
          if (user?.role === "director") {
            router.push("/director/dashboard")
          } else if (user?.role === "staff") {
            router.push("/staff/dashboard")
          }
          return
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, requiredPermissions, router, pathname])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null
  }

  // Check role access
  if (requiredRole && user?.role !== requiredRole) {
    return null
  }

  // Check permission access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some(
      (permission) => user?.permissions.includes(permission) || user?.permissions.includes("full_access"),
    )

    if (!hasPermission) {
      return null
    }
  }

  return <>{children}</>
}
