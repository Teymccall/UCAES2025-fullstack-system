// Paystack Payment Service for UCAES Fees Portal
export interface PaystackConfig {
  publicKey: string
  secretKey: string
  currency: string
  callbackUrl: string
}

export interface PaymentData {
  amount: number
  email: string
  reference: string
  callbackUrl: string
  channels?: string[]
  metadata: {
    studentId: string
    studentName: string
    paymentType: string
    paymentMethod?: string
    mobileNetwork?: string
    phoneNumber?: string
    services: string[]
    academicYear?: string
    semester?: string
  }
}

export interface PaymentResponse {
  success: boolean
  message: string
  data?: {
    authorizationUrl: string
    reference: string
    accessCode: string
  }
  error?: string
}

export interface PaymentVerification {
  success: boolean
  data?: {
    reference: string
    amount: number
    status: string
    gateway_response: string
    paid_at: string
    channel: string
    customer: {
      email: string
      customer_code: string
    }
    metadata: any
  }
  error?: string
}

class PaystackService {
  private config: PaystackConfig

  constructor(config: PaystackConfig) {
    this.config = config
  }

  // Initialize Paystack payment
  async initializePayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      // Make real API call to Paystack
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        return {
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorizationUrl: result.data.authorization_url,
            reference: result.data.reference,
            accessCode: result.data.access_code
          }
        }
      } else {
        throw new Error(result.message || 'Failed to initialize payment')
      }
    } catch (error) {
      console.error('Paystack payment initialization error:', error)
      return {
        success: false,
        message: 'Failed to initialize payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Verify payment status
  async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      // Make real API call to verify payment
      const response = await fetch(`/api/paystack/verify?reference=${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            reference: result.data.reference,
            amount: result.data.amount,
            status: result.data.status,
            gateway_response: result.data.gateway_response,
            paid_at: result.data.paid_at,
            channel: result.data.channel,
            customer: {
              email: result.data.customer?.email || '',
              customer_code: result.data.customer?.customer_code || ''
            },
            metadata: result.data.metadata || {}
          }
        }
      } else {
        throw new Error(result.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Paystack payment verification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get payment methods available
  getAvailablePaymentMethods() {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, Verve',
        icon: '💳',
        supported: true
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: '🏦',
        supported: true
      },
      {
        id: 'mobile-money',
        name: 'Mobile Money',
        description: 'MTN, Vodafone, AirtelTigo',
        icon: '📱',
        supported: true
      },
      {
        id: 'ussd',
        name: 'USSD',
        description: 'Pay via USSD code',
        icon: '📞',
        supported: true
      }
    ]
  }

  // Format amount for Paystack (amount in kobo for NGN, pesewas for GHS)
  formatAmount(amount: number, currency: string = 'GHS'): number {
    if (currency === 'GHS') {
      return Math.round(amount * 100) // Convert to pesewas
    }
    return Math.round(amount * 100) // Default to smallest currency unit
  }

  // Generate unique reference
  generateReference(studentId: string, timestamp: number = Date.now()): string {
    const random = Math.random().toString(36).substr(2, 9)
    return `UCAES-${studentId}-${timestamp}-${random}`.toUpperCase()
  }
}

// Default configuration (you should move these to environment variables)
const defaultConfig: PaystackConfig = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key_here',
  currency: 'GHS',
  callbackUrl: process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payment/callback'
}

// Export singleton instance
export const paystackService = new PaystackService(defaultConfig)

// Export the class for testing or custom instances
export default PaystackService
