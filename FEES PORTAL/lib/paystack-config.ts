// Paystack Configuration for UCAES Fees Portal
// Environment variables should be set in .env.local file

export const paystackConfig = {
  // Public key (visible to client)
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_c79226fde749dfd7bf30cf15dfcea04cfb617888',
  
  // Secret key (server-side only)
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_ff88b6c8cbc25c8447397fe2600511f2aa704c59',
  
  // Currency (GHS for Ghana Cedis, NGN for Nigerian Naira)
  currency: process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS',
  
  // Environment (test or live)
  environment: process.env.NEXT_PUBLIC_PAYSTACK_ENV || 'test',
  
  // Callback URL for payment completion
  callbackUrl: process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL || 'http://localhost:3000/payment/callback',
  
  // API endpoints
  apiEndpoints: {
    initialize: 'https://api.paystack.co/transaction/initialize',
    verify: 'https://api.paystack.co/transaction/verify',
    banks: 'https://api.paystack.co/bank',
    charges: 'https://api.paystack.co/charge'
  }
}

// Validation function
export const validatePaystackConfig = () => {
  const errors: string[] = []
  
  if (!paystackConfig.publicKey || paystackConfig.publicKey === 'pk_test_your_public_key_here') {
    errors.push('Paystack public key is not configured')
  }
  
  if (!paystackConfig.secretKey || paystackConfig.secretKey === 'sk_test_your_secret_key_here') {
    errors.push('Paystack secret key is not configured')
  }
  
  if (paystackConfig.environment === 'live' && paystackConfig.publicKey.startsWith('pk_test_')) {
    errors.push('Live environment detected but test public key is being used')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get configuration for specific environment
export const getEnvironmentConfig = () => {
  const isTest = paystackConfig.environment === 'test'
  
  return {
    ...paystackConfig,
    isTest,
    apiUrl: isTest ? 'https://api.paystack.co' : 'https://api.paystack.co',
    webhookUrl: isTest ? 'https://webhook.site' : 'https://your-domain.com/webhook'
  }
}
