"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import WalletDashboard from "@/components/student/wallet/wallet-dashboard"
import { PageLoader } from "@/components/ui/loader"

function WalletContent() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <PageLoader />
  }

  if (!user?.studentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access your wallet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <WalletDashboard
          studentId={user.studentId}
          studentName={user.name || 'Student'}
          studentEmail={user.email || ''}
        />
      </div>
    </div>
  )
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  )
}

