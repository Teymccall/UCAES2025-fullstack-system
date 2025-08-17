"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { paystackService } from "@/lib/paystack-service"
import Link from "next/link"

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'verifying'>('pending')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const reference = searchParams.get('reference')
  const status = searchParams.get('status')
  const amount = searchParams.get('amount')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setPaymentStatus('failed')
        setLoading(false)
        return
      }

      try {
        setPaymentStatus('verifying')
        
        // Verify payment with Paystack
        const verification = await paystackService.verifyPayment(reference)
        
        if (verification.success && verification.data) {
          setPaymentStatus('success')
          setPaymentData(verification.data)
          
          // Store payment record in localStorage for demo purposes
          // In production, this would be stored in your database
          const paymentRecord = {
            id: reference,
            reference: reference,
            amount: verification.data.amount / 100, // Convert from pesewas
            status: verification.data.status,
            method: verification.data.channel,
            timestamp: verification.data.paid_at,
            gatewayResponse: verification.data.gateway_response,
            metadata: verification.data.metadata
          }
          
          const existingPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
          localStorage.setItem('paymentHistory', JSON.stringify([...existingPayments, paymentRecord]))
          
          toast({
            title: "Payment Verified Successfully",
            description: `Payment of ¢${(verification.data.amount / 100).toLocaleString()} has been confirmed`,
          })
        } else {
          setPaymentStatus('failed')
          toast({
            title: "Payment Verification Failed",
            description: verification.error || "Unable to verify payment status",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setPaymentStatus('failed')
        toast({
          title: "Verification Error",
          description: "An error occurred while verifying your payment",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [reference, toast])

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />
      case 'verifying':
        return <Clock className="w-16 h-16 text-blue-600 animate-pulse" />
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-600" />
    }
  }

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'verifying':
        return 'Verifying Payment...'
      default:
        return 'Payment Pending'
    }
  }

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Your payment has been processed successfully and your fees have been updated.'
      case 'failed':
        return 'There was an issue processing your payment. Please try again or contact support.'
      case 'verifying':
        return 'We are verifying your payment with our payment processor. This may take a few moments.'
      default:
        return 'Your payment is being processed. Please wait while we confirm the transaction.'
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'verifying':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-yellow-200 bg-yellow-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Processing Payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your payment</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/payments" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Payment Status</h1>
        </div>

        {/* Payment Status Card */}
        <Card className={`${getStatusColor()} mb-6`}>
          <CardContent className="p-8 text-center">
            {getStatusIcon()}
            <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              {getStatusTitle()}
            </h2>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              {getStatusDescription()}
            </p>

            {/* Payment Details */}
            {paymentData && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{paymentData.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">¢{(paymentData.amount / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{paymentData.channel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {paymentData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(paymentData.paid_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {paymentStatus === 'success' && (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Link href="/fees" className="block">
                    <Button variant="outline" className="w-full">
                      View Updated Fees
                    </Button>
                  </Link>
                </>
              )}
              
              {paymentStatus === 'failed' && (
                <>
                  <Link href="/payments" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/fees" className="block">
                    <Button variant="outline" className="w-full">
                      Back to Fees
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/dashboard" className="block">
                <Button variant="ghost" className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentStatus === 'success' && (
              <>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Payment Confirmed</p>
                    <p className="text-sm text-green-700">Your payment has been received and confirmed</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Fees Updated</p>
                    <p className="text-sm text-green-700">Your fees balance has been updated automatically</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Receipt Available</p>
                    <p className="text-sm text-green-700">You can download your payment receipt</p>
                  </div>
                </div>
              </>
            )}
            
            {paymentStatus === 'failed' && (
              <>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Payment Not Processed</p>
                    <p className="text-sm text-red-700">Your payment was not completed successfully</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">No Charges Made</p>
                    <p className="text-sm text-red-700">No money was deducted from your account</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Try Again</p>
                    <p className="text-sm text-red-700">You can attempt the payment again or contact support</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

