"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, XCircle, Bell } from "lucide-react"
import type { FeesData } from "@/lib/types"

interface PaymentStatusAlertProps {
  feesData: FeesData
  recentPayments?: any[]
}

export function PaymentStatusAlert({ feesData, recentPayments = [] }: PaymentStatusAlertProps) {
  const pendingPayments = recentPayments.filter((p) => p.status === "pending")
  const rejectedPayments = recentPayments.filter((p) => p.status === "rejected")

  // Priority: Rejected > Overdue > Pending > Partial > Paid
  if (rejectedPayments.length > 0) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span>
              {rejectedPayments.length} payment{rejectedPayments.length > 1 ? "s" : ""} rejected. Please review and
              resubmit with correct details.
            </span>
            <Button variant="outline" size="sm" className="ml-4">
              View Details
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (feesData.status === "overdue") {
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(feesData.dueDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <span>
              Your payment is {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue. Late fees may apply. Please pay
              immediately.
            </span>
            <Button size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
              Pay Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (pendingPayments.length > 0) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          {pendingPayments.length} payment{pendingPayments.length > 1 ? "s" : ""} pending verification. We'll notify you
          once processed (1-2 business days).
        </AlertDescription>
      </Alert>
    )
  }

  if (feesData.status === "partial") {
    const daysUntilDue = Math.floor(
      (new Date(feesData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Bell className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <span>
              Outstanding balance: ${feesData.outstandingBalance.toLocaleString()}.
              {daysUntilDue > 0 ? `${daysUntilDue} days remaining` : "Due today"}.
            </span>
            <Button variant="outline" size="sm" className="ml-4">
              Make Payment
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (feesData.status === "paid") {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All fees are paid up to date. Thank you for your prompt payment!
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
