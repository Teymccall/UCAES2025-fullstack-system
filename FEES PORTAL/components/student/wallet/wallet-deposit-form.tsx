"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building,
  X,
  Loader2,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { paystackService } from "@/lib/paystack-service"
import type { PaymentData } from "@/lib/paystack-service"

interface WalletDepositFormProps {
  studentId: string
  studentName: string
  studentEmail: string
  onSuccess: () => void
  onCancel: () => void
}

export function WalletDepositForm({
  studentId,
  studentName,
  studentEmail,
  onSuccess,
  onCancel
}: WalletDepositFormProps) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  const [depositInitialized, setDepositInitialized] = useState(false)
  const [depositReference, setDepositReference] = useState('')
  const { toast } = useToast()

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'bank', label: 'Bank Transfer', icon: Building, description: 'Direct bank transfer' },
    { id: 'mobile-money', label: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' }
  ]

  const quickAmounts = [50, 100, 200, 500, 1000, 2000]

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    setAmount(numericValue)
  }

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString())
  }

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to deposit",
        variant: "destructive"
      })
      return false
    }

    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!studentEmail || !emailRegex.test(studentEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please ensure you have a valid email address. Contact support if your email is incorrect.",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleDeposit = async () => {
    if (!validateForm()) return

    setProcessing(true)
    try {
      const depositAmount = parseFloat(amount)
      const amountInPesewas = Math.round(depositAmount * 100)
      const reference = `WALLET-DEPOSIT-${studentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      setDepositReference(reference)

      const paymentData: PaymentData = {
        amount: amountInPesewas,
        email: studentEmail,
        reference: reference,
        callbackUrl: `${window.location.origin}/wallet/callback`,
        metadata: {
          studentId: studentId,
          studentName: studentName,
          paymentType: 'wallet_deposit',
          services: ['Wallet Deposit'],
          academicYear: '2024/2025',
          semester: 'Current'
        }
      }

      const response = await paystackService.initializePayment(paymentData)

      if (response.success && response.data) {
        setDepositInitialized(true)
        
        toast({
          title: "Deposit Initialized",
          description: "Redirecting to payment gateway...",
        })

        // Redirect to Paystack payment page
        window.location.href = response.data.authorizationUrl
      } else {
        throw new Error(response.error || 'Failed to initialize deposit')
      }
    } catch (error) {
      console.error('Deposit initialization error:', error)
      toast({
        title: "Deposit Error",
        description: error instanceof Error ? error.message : "Failed to initialize deposit",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  if (depositInitialized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Deposit Initialized</h2>
            <p className="text-green-700 mb-4">
              Your wallet deposit has been initialized successfully. Reference: {depositReference}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              You will be redirected to complete the payment. After successful payment, 
              the amount will be added to your wallet balance.
            </p>
            <Button 
              onClick={onCancel}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Add Money to Wallet
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount">Amount to Deposit (¢)</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="text-lg font-medium"
            />
            
            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Quick Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="text-sm"
                  >
                    ¢{quickAmount}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <method.icon className="w-6 h-6 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Summary */}
          {amount && parseFloat(amount) > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Deposit Summary</p>
                    <p className="text-sm text-green-700">
                      Amount: ¢{parseFloat(amount).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Wallet Deposit
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={processing || !amount || !paymentMethod}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Deposit ¢{amount || '0'}
                </>
              )}
            </Button>
          </div>

          {/* Information */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Deposits are processed securely via Paystack</p>
            <p>• Funds will be available in your wallet immediately after successful payment</p>
            <p>• You can use your wallet balance to pay for fees instantly</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
