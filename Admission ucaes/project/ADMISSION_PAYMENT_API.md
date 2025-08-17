# Admission Payment API Documentation

This document provides comprehensive documentation for the admission fee payment API endpoints.

## Overview

The admission payment API allows applicants to pay their admission application fees using Paystack. The system includes endpoints for initializing payments, verifying payments, handling webhooks, and checking payment status.

## API Endpoints

### 1. Initialize Payment

**Endpoint:** `POST /api/admission-payment/initialize`

**Description:** Initializes a new admission fee payment with Paystack.

**Request Body:**
```json
{
  "applicantId": "string",           // Required: Unique applicant ID
  "applicantName": "string",         // Required: Full name of applicant
  "applicantEmail": "string",        // Required: Valid email address
  "applicantPhone": "string",        // Optional: Phone number
  "program": "string",               // Required: Selected program
  "level": "string",                 // Required: Level (e.g., "100", "200")
  "amount": 20000,                   // Optional: Amount in pesewas (default: 20000 for GHS 200)
  "callbackUrl": "string"            // Optional: Custom callback URL
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admission payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "ADM-12345-1640995200000",
    "accessCode": "access_code_here"
  }
}
```

**Example Usage:**
```javascript
const initializePayment = async (applicantData) => {
  const response = await fetch('/api/admission-payment/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicantId: applicantData.id,
      applicantName: applicantData.fullName,
      applicantEmail: applicantData.email,
      applicantPhone: applicantData.phone,
      program: applicantData.program,
      level: applicantData.level
    })
  })
  
  const result = await response.json()
  if (result.success) {
    // Redirect to Paystack checkout
    window.location.href = result.data.authorizationUrl
  }
}
```

### 2. Verify Payment

**Endpoint:** `GET /api/admission-payment/verify?reference={reference}`

**Description:** Verifies a completed payment with Paystack using the payment reference.

**Query Parameters:**
- `reference` (required): The payment reference returned from Paystack

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "reference": "ADM-12345-1640995200000",
    "status": "success",
    "amount": 20000,
    "applicantId": "12345",
    "paymentRecord": { ... }
  }
}
```

### 3. Check Payment Status

**Endpoint:** `GET /api/admission-payment/status?applicantId={applicantId}&reference={reference}`

**Description:** Checks the current payment status for an applicant.

**Query Parameters:**
- `applicantId` (required): The applicant ID
- `reference` (optional): The payment reference for detailed payment info

**Response:**
```json
{
  "success": true,
  "data": {
    "applicantId": "12345",
    "paymentStatus": "completed",  // pending, processing, completed, failed
    "message": "Payment completed successfully",
    "applicationStatus": "payment_completed",
    "paymentDetails": { ... },
    "paymentCompletedAt": "2022-01-01T12:00:00.000Z"
  }
}
```

### 4. Webhook Handler

**Endpoint:** `POST /api/admission-payment/webhook`

**Description:** Handles Paystack webhook events for asynchronous payment notifications.

**Important:** This endpoint is called by Paystack automatically. Do not call it directly.

**Setup:**
1. Set webhook URL in Paystack dashboard: `https://yourdomain.com/api/admission-payment/webhook`
2. Configure webhook secret: `PAYSTACK_WEBHOOK_SECRET=your_webhook_secret`

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Base URL (for production)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Payment Flow

### Complete Payment Flow

1. **Initialize Payment:**
   - Applicant fills application form
   - System calls `/api/admission-payment/initialize`
   - Redirect to Paystack checkout page

2. **Payment Processing:**
   - Applicant completes payment on Paystack
   - Paystack redirects to callback URL
   - Webhook updates payment status asynchronously

3. **Verify Payment:**
   - Frontend calls `/api/admission-payment/verify`
   - System updates applicant record
   - Application status changes to "payment_completed"

4. **Status Monitoring:**
   - Frontend polls `/api/admission-payment/status` for updates
   - Shows appropriate success/error messages

### Test Cards

Use these test cards for development:

- **Successful Payment:** `4084084084084081`
- **Failed Payment:** `4000000000000002`
- **Insufficient Funds:** `4000000000000002`

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid webhook signature"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Applicant not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Database Structure

### Collections

#### `admissionApplications`
- Stores applicant information
- Updated with payment status

#### `admissionPayments`
- Stores payment records
- Links to applicant ID

### Payment Status Values

- `pending`: Payment not started
- `processing`: Payment in progress
- `completed`: Payment successful
- `failed`: Payment failed

## Frontend Integration Example

```javascript
// Complete payment flow
const handleAdmissionPayment = async (applicantData) => {
  try {
    // 1. Initialize payment
    const initResponse = await fetch('/api/admission-payment/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantId: applicantData.id,
        applicantName: applicantData.fullName,
        applicantEmail: applicantData.email,
        program: applicantData.program,
        level: applicantData.level
      })
    })
    
    const initResult = await initResponse.json()
    
    if (initResult.success) {
      // Store reference for later verification
      localStorage.setItem('admissionPaymentRef', initResult.data.reference)
      
      // Redirect to Paystack
      window.location.href = initResult.data.authorizationUrl
    } else {
      throw new Error(initResult.message)
    }
  } catch (error) {
    console.error('Payment initialization failed:', error)
    alert('Failed to initialize payment: ' + error.message)
  }
}

// After payment callback
const verifyAdmissionPayment = async (reference) => {
  try {
    const response = await fetch(`/api/admission-payment/verify?reference=${reference}`)
    const result = await response.json()
    
    if (result.success) {
      // Payment successful
      console.log('Payment verified:', result.data)
      // Redirect to next step
    } else {
      // Payment failed
      console.error('Payment verification failed:', result.message)
    }
  } catch (error) {
    console.error('Verification error:', error)
  }
}

// Poll for payment status
const pollPaymentStatus = async (applicantId) => {
  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/admission-payment/status?applicantId=${applicantId}`)
      const result = await response.json()
      
      if (result.data.paymentStatus === 'completed') {
        // Payment completed
        clearInterval(pollInterval)
        // Proceed to next step
      } else if (result.data.paymentStatus === 'failed') {
        // Payment failed
        clearInterval(pollInterval)
        // Show error message
      }
    } catch (error) {
      console.error('Status check error:', error)
    }
  }
  
  // Poll every 3 seconds
  const pollInterval = setInterval(checkStatus, 3000)
  
  // Stop polling after 5 minutes
  setTimeout(() => clearInterval(pollInterval), 300000)
}
```

## Security Notes

1. **Webhook Security:** Always verify webhook signatures
2. **API Keys:** Never expose secret keys in frontend code
3. **HTTPS:** Use HTTPS in production
4. **Validation:** Always validate input data
5. **Rate Limiting:** Consider implementing rate limiting for API endpoints

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Paystack account is properly configured
4. Test with provided test cards before going live