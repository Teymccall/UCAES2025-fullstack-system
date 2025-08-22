"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  ShoppingCart,
  Receipt,
  ArrowLeft,
  Zap,
  Wallet
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import PaystackPayment from "./paystack-payment"
import { useAuth } from "@/lib/auth-context"
import { walletService } from "@/lib/wallet-service"

interface SelectedService {
  service: {
    id: string
    name: string
    description?: string
    amount: number
    type: 'Service' | 'Mandatory' | 'Optional'
    category: string
  }
  quantity: number
  total: number
}

interface PaymentFormProps {
  onPaymentComplete?: () => void
}

export default function PaymentForm({ onPaymentComplete }: PaymentFormProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    reference: '',
    phone: '',
    email: ''
  })
  const [processing, setProcessing] = useState(false)
  const [usePaystack, setUsePaystack] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loadingWallet, setLoadingWallet] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // Load selected services from localStorage
    const storedServices = localStorage.getItem('selectedServices')
    if (storedServices) {
      try {
        const services = JSON.parse(storedServices)
        setSelectedServices(services)
        setPaymentDetails(prev => ({ ...prev, amount: services.reduce((total: number, item: SelectedService) => total + item.total, 0) }))
      } catch (error) {
        console.error('Error parsing stored services:', error)
      }
    }
  }, [])

  // Load wallet balance
  useEffect(() => {
    const loadWalletBalance = async () => {
      if (user?.studentId) {
        setLoadingWallet(true)
        try {
          const balance = await walletService.getWalletBalance(user.studentId)
          setWalletBalance(balance)
        } catch (error) {
          console.error('Error loading wallet balance:', error)
        } finally {
          setLoadingWallet(false)
        }
      }
    }

    loadWalletBalance()
  }, [user?.studentId])

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method)
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }))
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return
    }

    if (paymentDetails.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)
    try {
      if (paymentMethod === 'wallet') {
        // Handle wallet payment
        // Convert cedis to pesewas for wallet checks
        const amountInPesewas = Math.round(paymentDetails.amount * 100)
        const hasSufficientBalance = await walletService.hasSufficientBalance(user?.studentId || '', amountInPesewas)
        
        if (!hasSufficientBalance) {
          toast({
            title: "Insufficient Balance",
            description: "Your wallet balance is not sufficient for this payment",
            variant: "destructive"
          })
          setProcessing(false)
          return
        }

        // Create wallet payment transaction for fees
        const description = `Fee payment for semester`
        const metadata = {
          feeType: 'tuition_fee',
          academicYear: '2024/2025',
          semester: 'Current',
          paymentType: 'wallet'
        }

        // IMPORTANT: processFeePayment expects amount in PESEWAS (not cedis)
        // We convert cedis to pesewas: 1 cedi = 100 pesewas
        const success = await walletService.processFeePayment(
          user?.studentId || '',
          amountInPesewas,
          description,
          metadata
        )

        if (success) {
          toast({
            title: "Payment Successful!",
            description: `Payment of ¢${paymentDetails.amount.toLocaleString()} has been processed from your wallet`,
          })

          // Clear selected services
          localStorage.removeItem('selectedServices');
          
          if (onPaymentComplete) {
            onPaymentComplete();
          }

          // Redirect to fees page to show updated balance
          window.location.href = '/fees';
        } else {
          toast({
            title: "Payment Failed",
            description: "There was an error processing your wallet payment. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Simulate payment processing for other methods
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, this would call the actual payment API
        const paymentData = {
          services: selectedServices,
          paymentMethod,
          amount: paymentDetails.amount,
          reference: paymentDetails.reference || `PAY-${Date.now()}`,
          phone: paymentDetails.phone,
          email: paymentDetails.email,
          timestamp: new Date().toISOString(),
          status: 'completed'
        };

        // Store payment record (in production, this would go to the database)
        localStorage.setItem('paymentHistory', JSON.stringify([
          ...JSON.parse(localStorage.getItem('paymentHistory') || '[]'),
          paymentData
        ]));

        // Clear selected services
        localStorage.removeItem('selectedServices');

        toast({
          title: "Payment Successful!",
          description: `Payment of ¢${paymentDetails.amount.toLocaleString()} has been processed successfully`,
        });

        // Call the callback to refresh the parent component
        if (onPaymentComplete) {
          onPaymentComplete();
        }

        // Redirect to fees page
        window.location.href = '/fees';
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle Paystack payment completion
  const handlePaystackPaymentComplete = async (paymentData: any) => {
    try {
      // Add a timestamp to the metadata to ensure uniqueness
      const metadata = {
        feeType: 'tuition_fee',
        academicYear: '2024/2025',
        semester: 'Current',
        paymentType: 'paystack',
        paymentTimestamp: Date.now() // Add timestamp for uniqueness
      }

      // Show initial success message
      toast({
        title: "Payment Successful!",
        description: `Payment of ¢${(paymentData.amount / 100).toLocaleString()} has been processed via Paystack`,
      })

      // Use the new processPaystackFeePayment method to record the payment
      await walletService.processPaystackFeePayment(
        user?.studentId || '',
        paymentData.amount,
        paymentData.reference,
        paymentData,
        metadata
      )

      // Store payment record locally for UI
      localStorage.setItem('paymentHistory', JSON.stringify([
        ...JSON.parse(localStorage.getItem('paymentHistory') || '[]'),
        paymentData
      ]));

      // Clear selected services
      localStorage.removeItem('selectedServices');

      // Call the callback to refresh the parent component
      if (onPaymentComplete) {
        onPaymentComplete();
      }

      // Add a delay before redirecting to prevent potential duplicate transactions
      // This gives the system time to fully process the transaction
      setTimeout(() => {
        // Redirect to fees page to show updated payment status
        window.location.href = '/fees';
      }, 2000); // 2-second delay
    } catch (error) {
      console.error('Error recording Paystack payment:', error)
      toast({
        title: "Payment Recording Error",
        description: "Your payment was successful, but there was an error recording it. Please contact support.",
        variant: "destructive"
      })
    }
  }

  const getTotalAmount = () => {
    return selectedServices.reduce((total, item) => total + item.total, 0);
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'Mandatory':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Service':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Optional':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Services Selected</h2>
              <p className="text-gray-600 mb-6">
                You haven't selected any services to pay for. Please go back to the fees page and select services.
              </p>
              <Link href="/fees">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Fees
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If Paystack is enabled, show the Paystack payment component
  if (usePaystack) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Link href="/fees" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm sm:text-base">
                <ArrowLeft className="w-3 w-3 sm:w-4 sm:h-4 mr-2" />
                Back to Fees
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setUsePaystack(false)}
                size="sm"
              >
                Use Traditional Form
              </Button>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Pay with Paystack</h1>
            <p className="text-xs sm:text-base text-gray-600 mt-1 sm:mt-2">
              Secure payment processing powered by Paystack
            </p>
          </div>

          <PaystackPayment
            selectedServices={selectedServices}
            studentId={user?.studentId || ''}
            studentName={user?.name || ''}
            studentEmail={user?.email || ''}
            onPaymentComplete={(paymentData) => {
              toast({
                title: "Payment Successful!",
                description: `Payment of ¢${paymentData.amount.toLocaleString()} has been processed successfully`,
              })
              if (onPaymentComplete) {
                onPaymentComplete()
              }
            }}
            onPaymentError={(error) => {
              toast({
                title: "Payment Error",
                description: error,
                variant: "destructive"
              })
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link href="/fees" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 text-sm sm:text-base">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Back to Fees
          </Link>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1 sm:mt-2">Review your selected services and complete your payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Payment Form */}
          <div className="space-y-3 sm:gap-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Choose Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-3">
                  {/* Wallet Balance Display */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium text-blue-900">Wallet Balance</span>
                      </div>
                      <div className="text-right">
                        {loadingWallet ? (
                          <span className="text-sm text-blue-600">Loading...</span>
                        ) : (
                          <span className="font-bold text-blue-900">¢{(walletBalance / 100).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pay with Wallet Button */}
                  {walletBalance >= paymentDetails.amount * 100 && (
                    <Button
                      onClick={() => handlePaymentMethodSelect('wallet')}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Pay with Wallet (¢{(walletBalance / 100).toLocaleString()} available)
                    </Button>
                  )}

                  <Button
                    onClick={() => setUsePaystack(true)}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Pay with Paystack (Recommended)
                  </Button>
                  <div className="text-center text-sm text-gray-500">
                    - or -
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <strong>Traditional Payment Form</strong>
                    <p className="mt-1">Use the form below for manual payment processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 pt-0 sm:p-6 sm:pt-0">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Payment Method</label>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {[
                      { id: 'wallet', label: 'Wallet Balance', icon: '💼', disabled: walletBalance < paymentDetails.amount * 100 },
                      { id: 'mobile-money', label: 'Mobile Money', icon: '📱' },
                      { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                      { id: 'bank-transfer', label: 'Bank Transfer', icon: '🏦' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => !method.disabled && handlePaymentMethodSelect(method.id)}
                        disabled={method.disabled}
                        className={`p-2 sm:p-3 border rounded-lg text-left transition-colors ${
                          method.disabled
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            : paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg sm:text-2xl mr-2 sm:mr-3">{method.icon}</span>
                            <span className="font-medium text-xs sm:text-sm">{method.label}</span>
                          </div>
                          {method.disabled && (
                            <span className="text-xs text-gray-500">Insufficient balance</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Payment Amount (¢)</label>
                  <Input
                    type="number"
                    value={paymentDetails.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="text-sm sm:text-lg font-medium"
                  />
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Reference Number (Optional)</label>
                  <Input
                    value={paymentDetails.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    placeholder="Enter reference number"
                    className="text-sm"
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      value={paymentDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={paymentDetails.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || !paymentMethod || paymentDetails.amount <= 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 text-sm sm:text-lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      <span className="text-xs sm:text-base">Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-xs sm:text-base">Pay ¢{paymentDetails.amount.toLocaleString()}</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-3 sm:space-y-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center text-sm sm:text-lg">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {selectedServices.map((item) => (
                    <div key={item.service.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 last:border-b-0 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h4 className="font-medium text-xs sm:text-sm">{item.service.name}</h4>
                          <Badge className={`${getServiceTypeColor(item.service.type)} text-xs w-fit`}>
                            {item.service.type}
                          </Badge>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          ¢{item.service.amount.toLocaleString()} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-medium text-sm sm:text-base">¢{item.total.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">¢{getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1 text-xs sm:text-sm">Secure Payment</h4>
                    <p className="text-xs sm:text-sm text-blue-700">
                      Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
