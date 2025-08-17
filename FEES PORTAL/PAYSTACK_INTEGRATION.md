# Paystack Integration for UCAES Fees Portal

This document outlines the integration of Paystack payment gateway into the UCAES Fees Portal.

## Overview

The Paystack integration provides secure, reliable payment processing for student fee payments with support for multiple payment methods:

- **Credit/Debit Cards** (Visa, Mastercard, Verve)
- **Bank Transfers** (Direct bank transfers)
- **Mobile Money** (MTN, Vodafone, AirtelTigo)
- **USSD** (Pay via USSD codes)

## Features

### ✅ Implemented
- Payment initialization and processing
- Multiple payment method support
- Payment verification and status tracking
- Secure payment flow with Paystack
- Payment callback handling
- Transaction receipt generation
- Integration with existing fees system

### 🔄 In Progress
- Real Paystack API integration (currently using simulation)
- Webhook handling for payment notifications
- Database integration for payment records

### 📋 Planned
- Admin payment management dashboard
- Payment analytics and reporting
- Bulk payment processing
- Payment plan management
- Refund processing

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Student UI    │    │  Paystack API    │    │  Payment DB     │
│                 │    │                  │    │                 │
│ Payment Form    │───▶│  Initialize      │───▶│ Store Record    │
│ Payment Status  │    │  Verify          │    │ Update Balance  │
│ Receipt View    │    │  Webhooks        │    │ Generate Receipt│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## File Structure

```
FEES PORTAL/
├── lib/
│   ├── paystack-service.ts      # Paystack service layer
│   └── paystack-config.ts      # Configuration and validation
├── components/student/fees/
│   ├── paystack-payment.tsx    # Paystack payment component
│   └── payment-form.tsx        # Updated payment form
├── app/payment/
│   └── callback/
│       └── page.tsx            # Payment callback handler
└── PAYSTACK_INTEGRATION.md     # This documentation
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback
NEXT_PUBLIC_PAYSTACK_CURRENCY=GHS
NEXT_PUBLIC_PAYSTACK_ENV=test
```

### 2. Paystack Account Setup

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your API keys from the dashboard
3. Configure webhook endpoints (for production)
4. Set up your business profile and bank accounts

### 3. Testing

Use Paystack's test cards for development:

- **Visa**: 4084 0840 8408 4081
- **Mastercard**: 5105 1051 0510 5100
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **PIN**: Any 4 digits

## API Integration

### Payment Initialization

```typescript
const paymentData: PaymentData = {
  amount: 5000, // Amount in pesewas (50.00 GHS)
  email: 'student@example.com',
  reference: 'UCAES-12345-1234567890-ABC123',
  callbackUrl: 'https://your-domain.com/payment/callback',
  metadata: {
    studentId: 'UCAES12345',
    studentName: 'John Doe',
    paymentType: 'card',
    services: ['Tuition Fee', 'Library Fee'],
    academicYear: '2024/2025',
    semester: 'Second Semester'
  }
}

const response = await paystackService.initializePayment(paymentData)
```

### Payment Verification

```typescript
const verification = await paystackService.verifyPayment(reference)
if (verification.success) {
  // Payment confirmed
  const amount = verification.data.amount / 100 // Convert from pesewas
  const status = verification.data.status
  const channel = verification.data.channel
}
```

## Payment Flow

### 1. Student Selection
- Student selects services to pay for
- Chooses payment method (Paystack recommended)
- Enters payment details

### 2. Payment Initialization
- System generates unique reference
- Calls Paystack API to initialize payment
- Redirects to Paystack payment page

### 3. Payment Processing
- Student completes payment on Paystack
- Paystack processes the transaction
- Redirects back to callback URL

### 4. Payment Verification
- System verifies payment with Paystack
- Updates student fees balance
- Generates payment receipt
- Sends confirmation email

## Security Features

- **HTTPS Only**: All payment communications use HTTPS
- **Reference Validation**: Unique payment references prevent duplicates
- **Amount Verification**: Payment amounts are verified server-side
- **Metadata Validation**: Student information is validated
- **Environment Separation**: Test and live environments are separated

## Error Handling

The system handles various error scenarios:

- **Network Errors**: Retry mechanisms and user notifications
- **Payment Failures**: Clear error messages and retry options
- **Verification Failures**: Manual verification process
- **Invalid References**: Reference validation and error logging

## Monitoring and Logging

- Payment attempt logging
- Success/failure rate tracking
- Error monitoring and alerting
- Transaction audit trail

## Production Considerations

### 1. Security
- Move secret keys to secure environment variables
- Implement webhook signature verification
- Use HTTPS for all communications
- Implement rate limiting

### 2. Performance
- Implement payment caching
- Use database transactions for consistency
- Implement retry mechanisms
- Monitor API response times

### 3. Compliance
- Ensure PCI DSS compliance
- Implement data retention policies
- Follow local financial regulations
- Maintain audit logs

## Troubleshooting

### Common Issues

1. **Payment Not Initializing**
   - Check API keys configuration
   - Verify callback URL is accessible
   - Check network connectivity

2. **Payment Verification Fails**
   - Verify reference format
   - Check Paystack API status
   - Review error logs

3. **Callback Not Working**
   - Verify callback URL configuration
   - Check server accessibility
   - Review webhook configuration

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_PAYSTACK_DEBUG=true
```

## Support

For technical support:

- **Paystack Support**: [support@paystack.com](mailto:support@paystack.com)
- **UCAES IT Team**: [it@ucaes.edu.gh](mailto:it@ucaes.edu.gh)
- **Documentation**: [Paystack Docs](https://paystack.com/docs)

## Changelog

### Version 1.0.0 (Current)
- Initial Paystack integration
- Payment form integration
- Callback handling
- Basic payment verification

### Version 1.1.0 (Planned)
- Real Paystack API integration
- Webhook handling
- Database integration
- Admin dashboard

### Version 1.2.0 (Planned)
- Payment analytics
- Bulk processing
- Refund handling
- Advanced reporting

