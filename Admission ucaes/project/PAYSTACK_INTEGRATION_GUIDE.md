# Paystack Integration Testing Guide

## Overview
This guide helps you test the Paystack integration for the admission system. The integration includes payment processing, verification, and webhook handling.

## Prerequisites
1. Paystack account (https://paystack.com)
2. Test keys from Paystack dashboard
3. The admission system running locally

## Setup

### 1. Environment Variables
Create a `.env` file in the project root with your Paystack test keys:

```bash
# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_WEBHOOK_URL=https://your-domain.com/api/webhooks/paystack
```

### 2. Test Cards
Use these test cards from Paystack:
- **Successful Payment**: 4084084084084081
- **Failed Payment**: 4000000000000002
- **Insufficient Funds**: 4000000000000002

## Testing Steps

### 1. Test Payment Flow
1. Navigate to the payment form
2. Fill in applicant details (name, email, phone)
3. Select payment method (Mobile Money or Card)
4. Enter test card details
5. Complete payment

### 2. Verify Payment
- Check that payment status updates to 'paid'
- Verify payment details are saved in Firebase
- Confirm application step advances

### 3. Test Webhook
- Use Paystack webhook testing tools
- Verify webhook endpoint receives and processes events

### 4. Test Error Handling
- Test with invalid card details
- Test with insufficient funds
- Test network failures

## Common Issues and Solutions

### 1. CORS Issues
- Ensure your domain is whitelisted in Paystack dashboard
- Check that webhook URL is accessible publicly

### 2. Webhook Not Receiving Events
- Verify webhook URL is correct
- Check server logs for webhook requests
- Ensure webhook endpoint returns 200 status

### 3. Payment Verification Fails
- Check that transaction reference is correct
- Verify secret key is valid
- Check Paystack API status

## Testing Checklist

- [ ] Payment form loads correctly
- [ ] Payment initialization works
- [ ] Successful payment completes
- [ ] Payment details saved to Firebase
- [ ] Application status updates
- [ ] Payment verification works
- [ ] Error handling displays messages
- [ ] Webhook processing works
- [ ] Payment history displays correctly

## Debug Mode
Enable debug logging by setting:
```javascript
// In paystackConfig.ts
DEBUG: true
```

This will log all Paystack interactions to the console.