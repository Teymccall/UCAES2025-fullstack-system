import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Upload, DollarSign } from "lucide-react"
import type { PaymentRecord } from "@/lib/types"

interface PaymentTimelineProps {
  payments: PaymentRecord[]
}

export function PaymentTimeline({ payments }: PaymentTimelineProps) {
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Upload className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline</CardTitle>
          <CardDescription>Your payment history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No payments made yet</p>
            <p className="text-sm">Make your first payment to see it here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Timeline</CardTitle>
        <CardDescription>Recent payment activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPayments.slice(0, 5).map((payment, index) => (
            <div key={payment.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">{getStatusIcon(payment.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      ${payment.amount.toLocaleString()} - {payment.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.date).toLocaleDateString()} via {payment.method.toUpperCase()}
                    </p>
                    {payment.reference && <p className="text-xs text-gray-500 font-mono">Ref: {payment.reference}</p>}
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
                {payment.notes && <p className="text-sm text-gray-600 mt-1 italic">"{payment.notes}"</p>}
              </div>
            </div>
          ))}

          {sortedPayments.length > 5 && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500">Showing 5 of {sortedPayments.length} payments</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
