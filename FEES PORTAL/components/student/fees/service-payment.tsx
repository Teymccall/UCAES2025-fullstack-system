"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Wallet,
  ExternalLink,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { walletService } from "@/lib/wallet-service"
import { requestServices } from "@/lib/services"

interface ServicePaymentProps {
  selectedServices: Array<{
    service: { id: string; name: string; amount: number }
    quantity: number
    total: number
  }>
  notes?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ServicePayment({ 
  selectedServices, 
  notes, 
  onSuccess, 
  onCancel 
}: ServicePaymentProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [walletBalance, setWalletBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const totalAmount = selectedServices.reduce((sum, item) => sum + item.total, 0)
  const hasSufficientBalance = walletBalance >= totalAmount

  useEffect(() => {
    if (user?.studentId) {
      fetchWalletBalance()
    }
  }, [user?.studentId])

  const fetchWalletBalance = async () => {
    try {
      setLoading(true)
      const balance = await walletService.getWalletBalance(user!.studentId)
      setWalletBalance(balance)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWalletPayment = async () => {
    if (!user?.studentId || !user?.name) {
      toast({
        title: "Error",
        description: "Please ensure you're logged in",
        variant: "destructive"
      })
      return
    }

    if (!hasSufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Your wallet balance is insufficient for this payment",
        variant: "destructive"
      })
      return
    }

    try {
      setProcessing(true)
      
      // First, create the service request
      const requestSuccess = await requestServices(
        user.studentId,
        user.name,
        selectedServices,
        notes
      )

      if (!requestSuccess) {
        throw new Error("Failed to create service request")
      }

      // Then process the wallet payment
      const paymentSuccess = await walletService.processServicePayment(
        user.studentId,
        totalAmount,
        selectedServices.map(item => ({
          serviceId: item.service.id,
          serviceName: item.service.name,
          quantity: item.quantity,
          amount: item.service.amount,
          total: item.total
        })),
        notes || 'Service payment'
      )

      if (paymentSuccess) {
        toast({
          title: "Payment Successful!",
          description: `Successfully paid ¢${(totalAmount / 100).toLocaleString()} for ${selectedServices.length} service(s)`,
        })
        
        // Refresh wallet balance
        await fetchWalletBalance()
        
        // Close dialog and notify parent
        setShowPaymentDialog(false)
        onSuccess()
      } else {
        throw new Error("Payment processing failed")
      }
    } catch (error) {
      console.error('Error processing wallet payment:', error)
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePaystackPayment = () => {
    // Redirect to Paystack payment
    const servicesData = selectedServices.map(item => ({
      serviceId: item.service.id,
      serviceName: item.service.name,
      quantity: item.quantity,
      amount: item.service.amount,
      total: item.total
    }))

    // Store service data in session storage for Paystack callback
    sessionStorage.setItem('pendingServicePayment', JSON.stringify({
      studentId: user?.studentId,
      studentName: user?.name,
      services: servicesData,
      notes: notes,
      totalAmount: totalAmount
    }))

    // Redirect to Paystack payment page
    window.location.href = `/payment/service-payment?amount=${totalAmount}&description=Service Payment`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading payment options...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Choose how you want to pay for the selected services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Payment Option */}
          <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setPaymentMethod('wallet')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Pay from Wallet</h3>
                  <p className="text-sm text-gray-600">
                    Current balance: ¢{(walletBalance / 100).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">¢{(totalAmount / 100).toLocaleString()}</div>
                {hasSufficientBalance ? (
                  <Badge className="bg-green-100 text-green-800">Sufficient Balance</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Insufficient Balance</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Paystack Payment Option */}
          <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            paymentMethod === 'paystack' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setPaymentMethod('paystack')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-medium">Pay with Card</h3>
                  <p className="text-sm text-gray-600">
                    Credit/Debit card via Paystack
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">¢{(totalAmount / 100).toLocaleString()}</div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Payment Summary</h4>
            <div className="space-y-2">
              {selectedServices.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.service.name} (x{item.quantity})</span>
                  <span>¢{(item.total / 100).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>¢{(totalAmount / 100).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            
            {paymentMethod === 'wallet' ? (
              <Button 
                onClick={handleWalletPayment}
                disabled={!hasSufficientBalance || processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Pay from Wallet
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handlePaystackPayment}
                disabled={processing}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay with Card
              </Button>
            )}
          </div>

          {/* Insufficient Balance Warning */}
          {paymentMethod === 'wallet' && !hasSufficientBalance && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Insufficient wallet balance. Please add ¢{((totalAmount - walletBalance) / 100).toLocaleString()} to your wallet or choose card payment.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
