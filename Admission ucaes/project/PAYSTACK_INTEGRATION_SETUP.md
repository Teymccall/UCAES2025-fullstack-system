# UCAES Admission Payment System - Paystack Integration

## Overview
This system provides complete integration with Paystack for handling admission fee payments, including real-time tracking for admission officers and seamless payment processing for applicants.

## Features
- ✅ **Real Payment Processing** - No mock data, actual Paystack integration
- ✅ **Real-time Firebase Integration** - All payments tracked in Firebase
- ✅ **Admission Officer Dashboard** - Monitor payments in real-time
- ✅ **Webhook Support** - Automatic payment status updates
- ✅ **Payment Verification** - Secure payment confirmation
- ✅ **Test Environment Support** - Safe testing with Paystack test keys

## System Architecture

### API Endpoints
- `POST /api/admission-payment/initialize` - Start payment process
- `GET /api/admission-payment/verify` - Verify payment status
- `POST /api/admission-payment/webhook` - Handle Paystack webhooks
- `GET /api/admission-payment/status` - Check payment status

### Firebase Collections
- `admissionApplications` - Stores applicant data with payment status
- `admissionPayments` - Stores detailed payment records

## Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB2Vfsx8k4qK9YcLNN6pP8Q8Z8y7X8Z8Z8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ucaes2025.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ucaes2025
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ucaes2025.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 2. Paystack Account Setup
1. Create account at [paystack.com](https://paystack.com)
2. Get your test keys from the dashboard
3. Set up webhook URL: `https://your-domain.com/api/admission-payment/webhook`
4. Generate webhook secret

### 3. Install Dependencies
```bash
npm install @paystack/inline-js
npm install firebase
```

### 4. Testing the System

#### Test Card Numbers (Paystack Test Mode)
- **Successful Payment**: `4084084084084081`
- **Failed Payment**: `4000000000000002`
- **Insufficient Funds**: `4000000000000002`

#### Test Flow
1. **Applicant Payment**: Go to `/admission/payment` and complete payment
2. **Monitor in Dashboard**: Visit `/admission-officer/payments` to see real-time updates
3. **Verify Webhooks**: Check payment status changes automatically

## Usage Guide

### For Applicants
1. Navigate to the admission payment page
2. Enter applicant details and payment amount
3. Complete payment via Paystack
4. Payment status updates automatically

### For Admission Officers
1. Access the dashboard at `/admission-officer`
2. Click "Payment Monitoring" to view payment dashboard
3. Filter payments by status (pending, success, failed)
4. Search by applicant name, email, or reference
5. View detailed payment information

## Database Structure

### admissionApplications Collection
```javascript
{
  applicantId: "string",
  paymentStatus: "pending|success|failed",
  paymentReference: "string",
  paymentDetails: {
    amount: number,
    currency: "string",
    gateway: "paystack",
    paidAt: timestamp
  }
}
```

### admissionPayments Collection
```javascript
{
  applicantId: "string",
  reference: "string",
  amount: number,
  status: "pending|success|failed",
  gateway: "paystack",
  metadata: object,
  paidAt: timestamp,
  createdAt: timestamp
}
```

## Security Features
- Webhook signature verification
- Secure API endpoints
- Environment variable protection
- Input validation and sanitization

## Troubleshooting

### Common Issues
1. **Webhook not receiving**: Check webhook URL in Paystack dashboard
2. **Payment not updating**: Verify Firebase rules allow writes
3. **Test mode issues**: Ensure using test keys and test cards

### Debug Steps
1. Check browser console for errors
2. Verify Firebase connection
3. Test webhook endpoint manually
4. Check Paystack dashboard for transaction logs

## Next Steps
- Add payment receipt generation
- Implement payment analytics
- Add bulk payment processing
- Create payment reminder system

## Support
For technical support, check the Paystack documentation or contact the development team.