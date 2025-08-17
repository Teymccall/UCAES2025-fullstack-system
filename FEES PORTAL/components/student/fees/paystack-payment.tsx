"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  DollarSign,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { paystackService, type PaymentData } from "@/lib/paystack-service"

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

interface PaystackPaymentProps {
  selectedServices: SelectedService[]
  studentId: string
  studentName: string
  studentEmail: string
  onPaymentComplete?: (paymentData: any) => void
  onPaymentError?: (error: string) => void
}

export default function PaystackPayment({ 
  selectedServices, 
  studentId, 
  studentName, 
  studentEmail,
  onPaymentComplete,
  onPaymentError 
}: PaystackPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState({
    amount: selectedServices.reduce((total, item) => total + item.total, 0),
    reference: '',
    phone: '',
    email: studentEmail || '',
    // Mobile Money specific
    network: '',
    // Card Payment specific
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    // Bank Transfer specific
    bankName: '',
    accountNumber: ''
  })
  const [processing, setProcessing] = useState(false)
  const [paymentInitialized, setPaymentInitialized] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const { toast } = useToast()

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'bank', label: 'Bank Transfer', icon: Building, description: 'Direct bank transfer' },
    { id: 'mobile-money', label: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' },
    { id: 'ussd', label: 'USSD', icon: Smartphone, description: 'Pay via USSD code' }
  ]

  const mobileNetworks = [
    { id: 'mtn', name: 'MTN Mobile Money', code: '*170#' },
    { id: 'vodafone', name: 'Vodafone Cash', code: '*110#' },
    { id: 'airteltigo', name: 'AirtelTigo Money', code: '*185#' }
  ]

  const banks = [
    { id: 'gcb', name: 'GCB Bank' },
    { id: 'ecobank', name: 'Ecobank Ghana' },
    { id: 'absa', name: 'Absa Bank Ghana' },
    { id: 'stanbic', name: 'Stanbic Bank' },
    { id: 'fidelity', name: 'Fidelity Bank' },
    { id: 'cal', name: 'CAL Bank' },
    { id: 'unibank', name: 'UBA Ghana' },
    { id: 'other', name: 'Other Bank' }
  ]

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method)
    // Reset payment details when method changes
    setPaymentDetails(prev => ({
      ...prev,
      network: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
      bankName: '',
      accountNumber: ''
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }))
  }

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    }
    handleInputChange(field, formattedValue)
  }

  const validatePaymentDetails = (): boolean => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive"
      })
      return false
    }

    if (paymentDetails.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      })
      return false
    }

    if (!paymentDetails.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return false
    }

    // Validate method-specific fields
    if (paymentMethod === 'mobile-money' && !paymentDetails.network) {
      toast({
        title: "Network Required",
        description: "Please select a mobile money network",
        variant: "destructive"
      })
      return false
    }

    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardHolderName) {
        toast({
          title: "Card Details Required",
          description: "Please fill in all card details",
          variant: "destructive"
        })
        return false
      }
    }

    if (paymentMethod === 'bank' && !paymentDetails.bankName) {
      toast({
        title: "Bank Required",
        description: "Please select a bank",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const initializePaystackPayment = async () => {
    if (!validatePaymentDetails()) return

    setProcessing(true)
    try {
      const reference = paymentDetails.reference || paystackService.generateReference(studentId)
      setPaymentReference(reference)

      const paymentData: PaymentData = {
        amount: paystackService.formatAmount(paymentDetails.amount),
        email: paymentDetails.email,
        reference: reference,
        callbackUrl: `${window.location.origin}/payment/callback`,
        metadata: {
          studentId: studentId,
          studentName: studentName,
          paymentType: paymentMethod,
          services: selectedServices.map(s => s.service.name),
          academicYear: '2024/2025',
          semester: 'Second Semester'
        }
      }

      const response = await paystackService.initializePayment(paymentData)

      if (response.success && response.data) {
        setPaymentUrl(response.data.authorizationUrl)
        setPaymentInitialized(true)
        
        toast({
          title: "Payment Initialized",
          description: "Redirecting to payment gateway...",
        })

        // Redirect to Paystack's payment page
        window.location.href = response.data!.authorizationUrl
      } else {
        throw new Error(response.error || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment",
        variant: "destructive"
      })
      if (onPaymentError) {
        onPaymentError(error instanceof Error ? error.message : "Unknown error")
      }
    } finally {
      setProcessing(false)
    }
  }

  // Payment completion is now handled by the callback page
  // after redirecting back from Paystack

  const getTotalAmount = () => {
    return selectedServices.reduce((total, item) => total + item.total, 0)
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'Mandatory':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Service':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Optional':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (paymentInitialized) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Payment Initialized</h2>
          <p className="text-green-700 mb-4">
            Your payment has been initialized successfully. Reference: {paymentReference}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.open(paymentUrl, '_blank')}
              className="bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Complete Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPaymentInitialized(false)}
            >
              Back to Payment Form
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
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
        </CardContent>
      </Card>

      {/* Payment Details Form */}
      {paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Amount (¢)</label>
              <Input
                type="number"
                value={paymentDetails.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                className="text-lg font-medium"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium mb-2">Reference Number (Optional)</label>
              <Input
                value={paymentDetails.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Enter reference number"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  value={paymentDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={paymentDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Method-specific fields */}
            {paymentMethod === 'mobile-money' && (
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Money Network</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mobileNetworks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => handleInputChange('network', network.id)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        paymentDetails.network === network.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{network.name}</div>
                      <div className="text-sm text-gray-600">{network.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <Input
                    value={paymentDetails.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                    <Input
                      value={paymentDetails.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <Input
                      value={paymentDetails.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Holder Name</label>
                    <Input
                      value={paymentDetails.cardHolderName}
                      onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Bank</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {banks.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => handleInputChange('bankName', bank.id)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          paymentDetails.bankName === bank.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">{bank.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Number (Optional)</label>
                  <Input
                    value={paymentDetails.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
              </div>
            )}

            {/* Payment Button */}
            <Button
              onClick={initializePaystackPayment}
              disabled={processing}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initializing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pay ¢{paymentDetails.amount.toLocaleString()}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedServices.map((item) => (
              <div key={item.service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{item.service.name}</h4>
                    <Badge className={`${getServiceTypeColor(item.service.type)} text-xs`}>
                      {item.service.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    ¢{item.service.amount.toLocaleString()} × {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">¢{item.total.toLocaleString()}</div>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">¢{getTotalAmount().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
