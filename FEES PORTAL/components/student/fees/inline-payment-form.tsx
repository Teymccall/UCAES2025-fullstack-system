"use client"

import { useState } from "react"
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
  AlertCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

interface InlinePaymentFormProps {
  selectedServices?: SelectedService[]
  onPaymentComplete?: () => void
}

export default function InlinePaymentForm({ selectedServices = [], onPaymentComplete }: InlinePaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paymentDetails, setPaymentDetails] = useState({
    amount: selectedServices?.reduce((total, item) => total + item.total, 0) || 0,
    reference: '',
    phone: '',
    email: '',
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
  const { toast } = useToast()

  // If no services are selected, show a message
  if (!selectedServices || selectedServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            No Services Selected
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <p>You haven't selected any services for payment yet.</p>
            <p className="text-sm mt-2">Please go to the "Request Services" tab to select services first.</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              // You can add navigation logic here if needed
              toast({
                title: "Navigate to Services",
                description: "Please go to the Request Services tab to select services",
              })
            }}
          >
            Go to Request Services
          </Button>
        </CardContent>
      </Card>
    )
  }

  const paymentMethods = [
    { id: 'mobile-money', label: 'Mobile Money', icon: Smartphone, description: 'Pay with MTN, Vodafone, AirtelTigo' },
    { id: 'card', label: 'Card Payment', icon: CreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'bank-transfer', label: 'Bank Transfer', icon: Building, description: 'Direct bank transfer' }
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

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '')
    } else if (field === 'phone') {
      formattedValue = value.replace(/[^0-9]/g, '')
    }
    
    setPaymentDetails(prev => ({ ...prev, [field]: formattedValue }))
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

    // Validate based on payment method
    if (paymentMethod === 'mobile-money') {
      if (!paymentDetails.network) {
        toast({
          title: "Network Required",
          description: "Please select your mobile money network",
          variant: "destructive"
        })
        return
      }
      if (!paymentDetails.phone) {
        toast({
          title: "Phone Number Required",
          description: "Please enter your mobile money number",
          variant: "destructive"
        })
        return
      }
    }

    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardHolderName) {
        toast({
          title: "Card Details Required",
          description: "Please fill in all card details",
          variant: "destructive"
        })
        return
      }
    }

    if (paymentMethod === 'bank-transfer') {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber) {
        toast({
          title: "Bank Details Required",
          description: "Please fill in your bank details",
          variant: "destructive"
        })
        return
      }
    }

    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In production, this would call the actual payment API
      const paymentData = {
        services: selectedServices,
        paymentMethod,
        amount: paymentDetails.amount,
        reference: paymentDetails.reference || `PAY-${Date.now()}`,
        email: paymentDetails.email,
        timestamp: new Date().toISOString(),
        status: 'completed',
        ...(paymentMethod === 'mobile-money' && {
          network: paymentDetails.network,
          phone: paymentDetails.phone
        }),
        ...(paymentMethod === 'card' && {
          cardHolderName: paymentDetails.cardHolderName,
          cardLastFour: paymentDetails.cardNumber.slice(-4)
        }),
        ...(paymentMethod === 'bank-transfer' && {
          bankName: paymentDetails.bankName,
          accountNumber: paymentDetails.accountNumber
        })
      }

      // Store payment record (in production, this would go to the database)
      localStorage.setItem('paymentHistory', JSON.stringify([
        ...JSON.parse(localStorage.getItem('paymentHistory') || '[]'),
        paymentData
      ]))

      const getSuccessMessage = () => {
        switch (paymentMethod) {
          case 'mobile-money':
            const networkName = mobileNetworks.find(n => n.id === paymentDetails.network)?.name || 'Mobile Money'
            return `${networkName} payment of ¢${paymentDetails.amount.toLocaleString()} processed successfully`
          case 'card':
            return `Card payment of ¢${paymentDetails.amount.toLocaleString()} processed successfully`
          case 'bank-transfer':
            const bankName = banks.find(b => b.id === paymentDetails.bankName)?.name || 'Bank'
            return `${bankName} transfer of ¢${paymentDetails.amount.toLocaleString()} processed successfully`
          default:
            return `Payment of ¢${paymentDetails.amount.toLocaleString()} processed successfully`
        }
      }

      toast({
        title: "Payment Successful!",
        description: getSuccessMessage(),
      })

      // Call the callback to refresh the parent component
      if (onPaymentComplete) {
        onPaymentComplete()
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
      {/* Payment Form */}
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
              {paymentMethods.map((method) => {
                const IconComponent = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-2 sm:p-3 border rounded-lg text-left transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{method.label}</div>
                        <div className="text-xs text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
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
              readOnly
            />
          </div>

          {/* Payment Method Specific Fields */}
          {paymentMethod === 'mobile-money' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Select Network</label>
                <div className="grid grid-cols-1 gap-2">
                  {mobileNetworks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => handleInputChange('network', network.id)}
                      className={`p-2 border rounded-lg text-left transition-colors ${
                        paymentDetails.network === network.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs sm:text-sm">{network.name}</span>
                        <span className="text-xs text-gray-500">{network.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Mobile Money Number</label>
                <Input
                  value={paymentDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your mobile money number"
                  className="text-sm"
                />
              </div>
            </>
          )}

          {paymentMethod === 'card' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Card Holder Name</label>
                <Input
                  value={paymentDetails.cardHolderName}
                  onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                  placeholder="Enter name as on card"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Card Number</label>
                <Input
                  value={paymentDetails.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="text-sm"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Expiry Date</label>
                  <Input
                    value={paymentDetails.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    placeholder="MM/YY"
                    className="text-sm"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">CVV</label>
                  <Input
                    value={paymentDetails.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    placeholder="123"
                    className="text-sm"
                    maxLength={4}
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'bank-transfer' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Select Bank</label>
                <select
                  value={paymentDetails.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Choose your bank</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Account Number</label>
                <Input
                  value={paymentDetails.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter your account number"
                  className="text-sm"
                />
              </div>
            </>
          )}

          {/* Contact Information */}
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

      {/* Order Summary */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center text-sm sm:text-lg">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
              <span className="text-blue-600">¢{paymentDetails.amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Security Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1 text-xs sm:text-sm">Secure Payment</h4>
                <p className="text-xs text-blue-700">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
