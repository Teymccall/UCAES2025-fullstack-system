// Paystack Configuration for UCAES Admission System
export const PAYSTACK_CONFIG = {
  // Use test keys for development - replace with live keys for production
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_c79226fde749dfd7bf30cf15dfcea04cfb617888',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_test_ff88b6c8cbc25c8447397fe2600511f2aa704c59',
  
  // Application fee amount in pesewas (GHS 200 = 20000 pesewas)
  applicationFee: 20000,
  
  // Currency
  currency: 'GHS',
  
  // Paystack webhook URL (for backend verification)
  webhookUrl: import.meta.env.VITE_PAYSTACK_WEBHOOK_URL || 'https://your-backend-url.com/webhook/paystack',
  
  // Callback URLs
  callbackUrl: window.location.origin + '/payment/callback',
};

// Payment channels configuration
export const PAYMENT_CHANNELS = [
  'card',
  'bank',
  'ussd',
  'qr',
  'mobile_money',
  'bank_transfer'
];

// Paystack plan configuration for subscription services (if needed later)
export const PAYSTACK_PLANS = {
  applicationFee: {
    name: 'UCAES Application Fee',
    amount: 20000,
    currency: 'GHS',
    interval: 'one-time'
  }
};

// Error messages
export const PAYMENT_ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Invalid payment amount',
  NETWORK_ERROR: 'Network error occurred. Please try again',
  PAYMENT_CANCELLED: 'Payment was cancelled',
  PAYMENT_FAILED: 'Payment failed. Please try again',
  INVALID_REFERENCE: 'Invalid payment reference',
  VERIFICATION_FAILED: 'Payment verification failed'
};