import { PAYSTACK_CONFIG, PAYMENT_CHANNELS } from './paystackConfig';

export interface PaystackPaymentData {
  amount: number;
  email: string;
  reference: string;
  metadata: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

export interface PaystackResponse {
  status: string;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    created_at: string;
    channel: string;
    metadata: any;
    customer: {
      email: string;
      customer_code: string;
    };
  };
}

class PaystackService {
  private publicKey: string;
  private secretKey: string;

  constructor() {
    this.publicKey = PAYSTACK_CONFIG.publicKey;
    this.secretKey = PAYSTACK_CONFIG.secretKey;
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `UCAES-ADM-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Create Paystack payment configuration
   */
  createPaymentConfig(
    email: string,
    amount: number = PAYSTACK_CONFIG.applicationFee,
    metadata?: any
  ): PaystackPaymentData {
    return {
      amount: amount,
      email: email,
      reference: this.generateReference(),
      metadata: {
        custom_fields: [
          {
            display_name: 'Application Type',
            variable_name: 'application_type',
            value: metadata?.applicationType || 'Undergraduate'
          },
          {
            display_name: 'Applicant Name',
            variable_name: 'applicant_name',
            value: metadata?.applicantName || 'Applicant'
          },
          {
            display_name: 'Application ID',
            variable_name: 'application_id',
            value: metadata?.applicationId || 'N/A'
          }
        ]
      }
    };
  }

  /**
   * Initialize Paystack payment and get authorization URL
   */
  async initializePayment(
    email: string,
    amount: number = PAYSTACK_CONFIG.applicationFee,
    metadata?: any
  ): Promise<{ authorizationUrl: string; reference: string; accessCode: string }> {
    try {
      console.log('🔧 PaystackService: Starting payment initialization...');
      console.log('📧 Email:', email);
      console.log('💰 Amount (pesewas):', amount);
      console.log('📋 Metadata:', metadata);
      
      const paymentConfig = this.createPaymentConfig(email, amount, metadata);
      console.log('⚙️ Payment config created:', paymentConfig);
      
      const requestBody = {
        amount: paymentConfig.amount,
        email: paymentConfig.email,
        reference: paymentConfig.reference,
        callback_url: PAYSTACK_CONFIG.callbackUrl,
        metadata: paymentConfig.metadata,
        currency: PAYSTACK_CONFIG.currency,
        channels: PAYMENT_CHANNELS
      };
      
      console.log('📤 Sending request to Paystack API:', requestBody);
      console.log('🔑 Using secret key:', this.secretKey.substring(0, 10) + '...');
      console.log('🌐 Paystack API URL: https://api.paystack.co/transaction/initialize');
      
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Paystack response status:', response.status);
      console.log('📥 Paystack response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to initialize payment';
        try {
          const errorData = await response.json();
          console.error('❌ Paystack API error response:', errorData);
          errorMessage = errorData.message || 'Failed to initialize payment';
        } catch (jsonError) {
          console.error('❌ Failed to parse error response:', jsonError);
          const textResponse = await response.text();
          console.error('❌ Raw error response:', textResponse);
          errorMessage = `Payment initialization failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse success response:', jsonError);
        const textResponse = await response.text();
        console.error('❌ Raw success response:', textResponse);
        throw new Error('Invalid response format from Paystack API');
      }
      console.log('✅ Paystack API success response:', result);
      
      if (result.status && result.data) {
        const paymentResult = {
          authorizationUrl: result.data.authorization_url,
          reference: result.data.reference,
          accessCode: result.data.access_code
        };
        
        console.log('🎉 Payment initialization successful:', paymentResult);
        return paymentResult;
      } else {
        console.error('❌ Invalid Paystack response format:', result);
        throw new Error('Invalid response from Paystack');
      }
    } catch (error) {
      console.error('❌ PaystackService: Payment initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify payment with Paystack
   */
  async verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to verify payment';
        try {
          const errorData = await response.json();
          console.error('❌ Paystack verification error response:', errorData);
          errorMessage = errorData.message || 'Failed to verify payment';
        } catch (jsonError) {
          console.error('❌ Failed to parse verification error response:', jsonError);
          const textResponse = await response.text();
          console.error('❌ Raw verification error response:', textResponse);
          errorMessage = `Payment verification failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('❌ Failed to parse verification success response:', jsonError);
        const textResponse = await response.text();
        console.error('❌ Raw verification success response:', textResponse);
        throw new Error('Invalid response format from Paystack verification API');
      }
      
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Get payment details from Paystack
   */
  async getPaymentDetails(reference: string): Promise<PaystackVerificationResponse> {
    return this.verifyPayment(reference);
  }

  /**
   * Format amount from pesewas to GHS
   */
  formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  /**
   * Convert GHS to pesewas
   */
  convertToPesewas(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Check if payment was successful
   */
  isPaymentSuccessful(response: PaystackVerificationResponse): boolean {
    return response.status && response.data?.status === 'success';
  }

  /**
   * Get payment method from response
   */
  getPaymentMethod(response: PaystackVerificationResponse): string {
    return response.data?.channel || 'unknown';
  }

  /**
   * Get payment date from response
   */
  getPaymentDate(response: PaystackVerificationResponse): string {
    return response.data?.paid_at || response.data?.created_at || new Date().toISOString();
  }

  /**
   * Create payment record for Firebase
   */
  createPaymentRecord(response: PaystackVerificationResponse, applicationId: string) {
    if (!response.data) return null;

    return {
      amount: response.data.amount,
      currency: response.data.currency,
      reference: response.data.reference,
      status: response.data.status,
      paidAt: response.data.paid_at,
      channel: response.data.channel,
      customerEmail: response.data.customer.email,
      customerCode: response.data.customer.customer_code,
      metadata: response.data.metadata,
      applicationId: applicationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const paystackService = new PaystackService();
export default paystackService;