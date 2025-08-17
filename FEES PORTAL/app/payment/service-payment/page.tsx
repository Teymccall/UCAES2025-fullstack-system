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
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ServicePaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  
  const amount = searchParams.get('amount')
  const description = searchParams.get('description') || 'Service Payment'

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!amount) {
      toast({
        title: "Error",
        description: "No payment amount specified",
        variant: "destructive"
      })
      router.push('/fees')
      return
    }

    // Get pending service payment data from session storage
    const pendingPayment = sessionStorage.getItem('pendingServicePayment')
    if (!pendingPayment) {
      toast({
        title: "Error",
        description: "No pending payment found",
        variant: "destructive"
      })
      router.push('/fees')
      return
    }

    setLoading(false)
  }, [user, amount, router, toast])

  const handlePaystackPayment = async () => {
    if (!user || !amount) return

    try {
      setProcessing(true)
      
      // Get pending service payment data
      const pendingPaymentStr = sessionStorage.getItem('pendingServicePayment')
      if (!pendingPaymentStr) {
        throw new Error('No pending payment data found')
      }

      const pendingPayment = JSON.parse(pendingPaymentStr)
      
      // Initialize Paystack payment
      const paymentData = {
        amount: parseInt(amount), // Amount in pesewas
        email: user.email || '',
        reference: `SR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        callback_url: `${window.location.origin}/payment/service-payment/callback`,
        metadata: {
          studentId: user.studentId,
          studentName: user.name,
          services: pendingPayment.services,
          notes: pendingPayment.notes,
          paymentType: 'service_payment'
        }
      }

      const response = await paystackService.initializePayment(paymentData)
      
      if (response.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        throw new Error(response.error || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      setPaymentStatus('failed')
      toast({
        title: "Payment Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    // Clear pending payment data
    sessionStorage.removeItem('pendingServicePayment')
    router.push('/fees')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Service Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">¢{(parseInt(amount || '0') / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Description:</span>
                <span className="text-sm text-gray-600">{description}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">Payment successful!</span>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Payment failed. Please try again.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handlePaystackPayment}
              disabled={processing || paymentStatus === 'success'}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay with Card'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={processing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          {/* Payment Instructions */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p><strong>Note:</strong> You will be redirected to Paystack to complete your payment securely.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

