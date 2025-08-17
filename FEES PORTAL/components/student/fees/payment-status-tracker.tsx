"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  CreditCard, 
  Eye, 
  RefreshCw,
  AlertTriangle,
  MessageSquare
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { PaymentRecord, PaymentVerificationStep } from "@/lib/types"

interface PaymentStatusTrackerProps {
  payment: PaymentRecord
  onViewReceipt?: () => void
  onRetryPayment?: () => void
}

export function PaymentStatusTracker({ 
  payment, 
  onViewReceipt, 
  onRetryPayment 
}: PaymentStatusTrackerProps) {
  
  const getStatusBadge = (status: PaymentRecord['status']) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft", icon: FileText },
      submitted: { variant: "default" as const, label: "Submitted", icon: Clock },
      under_review: { variant: "default" as const, label: "Under Review", icon: Eye },
      verified: { variant: "default" as const, label: "Verified", icon: CheckCircle },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: XCircle },
      refunded: { variant: "secondary" as const, label: "Refunded", icon: RefreshCw }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getVerificationStepIcon = (step: PaymentVerificationStep) => {
    if (step.status === "completed") return <CheckCircle className="h-4 w-4 text-green-600" />
    if (step.status === "failed") return <XCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-yellow-600" />
  }

  const getStepLabel = (step: string) => {
    const labels = {
      document_check: "Document Verification",
      amount_verification: "Amount Verification", 
      reference_validation: "Reference Validation",
      final_approval: "Final Approval"
    }
    return labels[step as keyof typeof labels] || step
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment #{payment.id}
            </CardTitle>
            <CardDescription>
              {formatCurrency(payment.amount)} • {payment.method?.toUpperCase() || payment.paymentMethod?.toUpperCase() || 'N/A'} • {formatDate(payment.date)}
            </CardDescription>
          </div>
          {getStatusBadge(payment.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Category:</span>
            <p className="capitalize">{payment.category}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Reference:</span>
            <p className="font-mono text-xs">{payment.reference}</p>
          </div>
          {payment.submittedAt && (
            <div>
              <span className="font-medium text-gray-600">Submitted:</span>
              <p>{formatDate(payment.submittedAt)}</p>
            </div>
          )}
          {payment.reviewedAt && (
            <div>
              <span className="font-medium text-gray-600">Reviewed:</span>
              <p>{formatDate(payment.reviewedAt)}</p>
            </div>
          )}
        </div>

        {/* Verification Steps */}
        {payment.verificationSteps && payment.verificationSteps.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Verification Progress</h4>
            <div className="space-y-2">
              {payment.verificationSteps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getVerificationStepIcon(step)}
                    <div>
                      <p className="font-medium text-sm">{getStepLabel(step.step)}</p>
                      {step.completedAt && (
                        <p className="text-xs text-gray-500">
                          Completed {formatDate(step.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {step.notes && (
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {payment.status === "rejected" && payment.rejectionReason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Payment Rejected</h4>
                <p className="text-sm text-red-800 mt-1">{payment.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Notes</h4>
            <p className="text-sm text-blue-800">{payment.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t">
          {payment.receiptUrl && onViewReceipt && (
            <Button variant="outline" size="sm" onClick={onViewReceipt}>
              <Eye className="h-4 w-4 mr-2" />
              View Receipt
            </Button>
          )}
          
          {payment.status === "rejected" && onRetryPayment && (
            <Button size="sm" onClick={onRetryPayment}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Payment
            </Button>
          )}
          
          {payment.status === "draft" && (
            <Button size="sm" variant="default">
              <FileText className="h-4 w-4 mr-2" />
              Complete Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}