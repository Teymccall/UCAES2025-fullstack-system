"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { paystackService } from "@/lib/paystack-service"
import { walletService } from "@/lib/wallet-service"
import { requestServices } from "@/lib/services"
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react"

export default function ServicePaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying')
  const [paymentData, setPaymentData] = useState<any>(null)
  
  const reference = searchParams.get('reference')
  const trxref = searchParams.get('trxref')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference || !trxref) {
        setPaymentStatus('failed')
        setLoading(false)
        return
      }

      try {
        setProcessing(true)
        
        // Verify payment with Paystack
        const verification = await paystackService.verifyPayment(reference)
        
        if (verification.success && verification.data) {
          // Get pending service payment data
          const pendingPaymentStr = sessionStorage.getItem('pendingServicePayment')
          if (!pendingPaymentStr) {
            throw new Error('No pending payment data found')
          }

          const pendingPayment = JSON.parse(pendingPaymentStr)
          
          // Create service request
          const requestSuccess = await requestServices(
            pendingPayment.studentId,
            pendingPayment.studentName,
            pendingPayment.services.map((service: any) => ({
              service: {
                id: service.serviceId,
                name: service.serviceName,
                amount: service.amount
              },
              quantity: service.quantity,
              total: service.total
            })),
            pendingPayment.notes
          )

          if (!requestSuccess) {
            throw new Error('Failed to create service request')
          }

          // Process payment to wallet (for tracking)
          const paymentSuccess = await walletService.processPaystackServicePayment(
            pendingPayment.studentId,
            pendingPayment.totalAmount,
            reference,
            verification.data,
            pendingPayment.services
          )

          if (paymentSuccess) {
            // Show success message immediately
            toast({
              title: "Payment Successful!",
              description: `¢${(verification.data.amount / 100).toLocaleString()} payment completed successfully`,
            })
            
            // Add a short delay before updating UI state to prevent race conditions
            setTimeout(() => {
              setPaymentStatus('success')
              setPaymentData(verification.data)
              
              // Clear pending payment data
              sessionStorage.removeItem('pendingServicePayment')
            }, 1000)
          } else {
            throw new Error('Failed to process payment')
          }
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
          title: "Payment Failed",
          description: "Payment verification failed. Please contact support.",
          variant: "destructive"
        })
      } finally {
        setProcessing(false)
        setLoading(false)
      }
    }

    verifyPayment()
  }, [reference, trxref, toast])

  const handleContinue = () => {
    router.push('/fees')
  }

  const handleViewTransactions = () => {
    router.push('/transactions')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Verifying payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-lg font-medium text-green-800">Payment Successful!</span>
              </div>
              {paymentData && (
                <div className="text-center space-y-2">
                  <p className="text-green-700">
                    Amount: ¢{(paymentData.amount / 100).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    Reference: {paymentData.reference}
                  </p>
                </div>
              )}
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-lg font-medium text-red-800">Payment Failed</span>
              </div>
              <p className="text-center text-red-700">
                Your payment could not be processed. Please try again or contact support.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {paymentStatus === 'success' && (
              <>
                <Button 
                  onClick={handleViewTransactions}
                  className="w-full"
                >
                  View Transaction History
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleContinue}
                  className="w-full"
                >
                  Continue to Fees
                </Button>
              </>
            )}

            {paymentStatus === 'failed' && (
              <Button 
                onClick={handleContinue}
                className="w-full"
              >
                Back to Fees
              </Button>
            )}
          </div>

          {/* Additional Information */}
          {paymentStatus === 'success' && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p><strong>Note:</strong> Your service request has been created and payment has been recorded. You can view your transaction history for details.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

