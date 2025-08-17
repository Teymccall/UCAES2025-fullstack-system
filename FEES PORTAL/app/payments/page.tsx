"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { getPaymentHistory, getPaymentAnalytics, getStudentFees } from "@/lib/firebase"
import type { PaymentRecord, PaymentAnalytics, FeesData } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PaymentDashboard } from "@/components/student/fees/payment-dashboard"
import PaymentForm from "@/components/student/fees/payment-form"
import PortalHeader from "@/components/shared/portal-header"
import { PageLoader, CardLoader } from "@/components/ui/loader"

function PaymentsContent() {
  const { user, logout } = useAuth()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [feesData, setFeesData] = useState<FeesData | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.studentId) return

      try {
        setLoading(true)
        const [paymentHistory, paymentAnalytics, studentFees] = await Promise.all([
          getPaymentHistory(user.studentId),
          getPaymentAnalytics(user.studentId),
          getStudentFees(user.studentId)
        ])
        
        setPayments(paymentHistory)
        setAnalytics(paymentAnalytics)
        setFeesData(studentFees)
      } catch (error) {
        console.error("Error fetching payment data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleCreatePayment = () => {
    setShowPaymentForm(true)
  }

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false)
  }

  // Payment form handles its own submission and will call onPaymentComplete when done

  const handleViewReceipt = (paymentId: string) => {
    // Open receipt viewer
    console.log("View receipt for payment:", paymentId)
  }

  const handleRetryPayment = (paymentId: string) => {
    // Navigate to retry payment form
    console.log("Retry payment:", paymentId)
  }

  if (loading) {
    return <PageLoader color="#166534" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <PortalHeader currentPage="payments" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-xs sm:text-base text-gray-600 mt-1 sm:mt-2">
                Track your payment history and manage fee payments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
                ID: {user?.studentId}
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {showPaymentForm && feesData && (
          <div className="mb-4 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Make a Payment</h2>
                  <Button variant="ghost" onClick={handleClosePaymentForm} size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <PaymentForm
                  onPaymentComplete={() => {
                    setShowPaymentForm(false)
                    // Refresh the data
                    window.location.reload()
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Dashboard */}
        {analytics && (
          <PaymentDashboard
            payments={payments}
            analytics={analytics}
            onCreatePayment={handleCreatePayment}
            onViewReceipt={handleViewReceipt}
            onRetryPayment={handleRetryPayment}
          />
        )}
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <PaymentsContent />
    </ProtectedRoute>
  )
}