"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Loader2 } from "lucide-react"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: "director" | "staff" | "finance_officer" | "exam_officer" | "admissions_officer" | "registrar" | "Lecturer"
  requiredPermissions?: string[]
}

export function RouteGuard({ children, requiredRole, requiredPermissions }: RouteGuardProps) {
  const { user, loading, refreshAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = !!user

  useEffect(() => {
    console.log("[RouteGuard] user:", user, "loading:", loading, "authenticated:", isAuthenticated)
    
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log("[RouteGuard] Not authenticated, redirecting to /login")
        router.push("/login")
        return
      }

      // Ensure Firebase Auth is properly signed in for Firestore access (throttled in context)
      if (isAuthenticated && user) {
        refreshAuth().catch(() => {})
      }

      // Check role-based access
      if (requiredRole && user?.role !== requiredRole) {
        // Special case: if required role is "staff", allow any staff-type role
        if (requiredRole === "staff" && ["staff", "finance_officer", "exam_officer", "admissions_officer", "registrar", "Lecturer"].includes(user?.role)) {
          // Allow access - finance_officer can access staff routes
          console.log("[RouteGuard] Finance officer accessing staff route - allowed")
        } else {
          console.log("[RouteGuard] Role mismatch. Required:", requiredRole, "User role:", user?.role)
          // Redirect to appropriate dashboard based on user role
          if (user?.role === "director") {
            router.push("/director/dashboard")
          } else if (["staff", "finance_officer", "exam_officer", "admissions_officer", "registrar", "Lecturer"].includes(user?.role)) {
            router.push("/staff/dashboard")
          } else {
            router.push("/login")
          }
          return
        }
      }

      // Check permission-based access
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(
          (permission) => user?.permissions.includes(permission) || user?.permissions.includes("full_access"),
        )

        if (!hasPermission) {
          console.log("[RouteGuard] Permission denied")
          // Redirect to dashboard if no permission
          if (user?.role === "director") {
            router.push("/director/dashboard")
          } else if (["staff", "finance_officer", "exam_officer", "admissions_officer", "registrar", "Lecturer"].includes(user?.role)) {
            router.push("/staff/dashboard")
          }
          return
        }
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, requiredPermissions, router, pathname, refreshAuth])

  // Show loading spinner while checking authentication
  if (loading) {
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

  // Check role access - if checking for "staff", allow all staff-type roles
  if (requiredRole && user?.role !== requiredRole) {
    // Special case: if required role is "staff", allow any staff-type role
    if (requiredRole === "staff" && ["staff", "finance_officer", "exam_officer", "admissions_officer", "registrar", "Lecturer"].includes(user?.role)) {
      // Allow access
    } else {
      return null
    }
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
