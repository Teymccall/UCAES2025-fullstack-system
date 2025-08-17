import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'

// Firebase configuration - using actual UCAES 2025 config
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
}

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

// Paystack webhook secret for signature verification
const paystackWebhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || 'whsec_test_webhook_secret'

// Function to verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string | null): boolean {
  if (!signature) return false
  
  const hash = crypto
    .createHmac('sha512', paystackWebhookSecret)
    .update(body, 'utf8')
    .digest('hex')
  
  return signature === `sha512=${hash}`
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    
    console.log('🔔 Paystack webhook received');
    console.log('📋 Raw body:', body);
    console.log('🔐 Signature:', signature);

    // Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    console.log('📊 Webhook event type:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data)
        break
      
      case 'charge.failed':
        await handleFailedPayment(event.data)
        break
      
      default:
        console.log('ℹ️ Ignoring webhook event:', event.event)
    }

    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const metadata = data.metadata
    const reference = data.reference
    const applicantId = metadata?.applicantId

    if (!applicantId) {
      console.error('❌ Missing applicantId in webhook metadata')
      return
    }

    console.log('✅ Processing successful admission payment:', {
      reference: reference,
      applicantId: applicantId,
      amount: data.amount,
      status: data.status
    })

    // Check if payment was already processed
    const paymentDocRef = doc(db, 'admissionPayments', reference)
    const paymentDoc = await getDoc(paymentDocRef)
    
    if (paymentDoc.exists() && paymentDoc.data().status === 'success') {
      console.log('ℹ️ Payment already processed, skipping...')
      return
    }

    // Update applicant payment status
    const applicantRef = doc(db, 'admissionApplications', applicantId)
    const applicantDoc = await getDoc(applicantRef)

    if (!applicantDoc.exists()) {
      console.error('❌ Applicant not found:', applicantId)
      return
    }

    // Prepare payment record
    const paymentRecord = {
      reference: reference,
      amount: data.amount,
      status: 'success',
      gatewayResponse: data.gateway_response,
      paidAt: data.paid_at,
      channel: data.channel,
      customerEmail: data.customer?.email,
      customerCode: data.customer?.customer_code,
      authorizationCode: data.authorization?.authorization_code,
      cardDetails: {
        last4: data.authorization?.last4,
        cardType: data.authorization?.card_type,
        bank: data.authorization?.bank
      },
      metadata: metadata,
      processedAt: new Date().toISOString(),
      paymentType: 'admission_fee',
      event: 'webhook_charge_success'
    }

    // Update applicant document
    await updateDoc(applicantRef, {
      paymentStatus: 'paid',
      paymentDetails: paymentRecord,
      paymentCompletedAt: new Date().toISOString(),
      applicationStatus: 'payment_completed',
      updatedAt: new Date().toISOString()
    })

    // Create/update payment record
    await setDoc(paymentDocRef, {
      ...paymentRecord,
      applicantId: applicantId,
      applicantName: metadata?.applicantName,
      applicantEmail: metadata?.applicantEmail,
      program: metadata?.program,
      level: metadata?.level,
      createdAt: paymentDoc.exists() ? paymentDoc.data().createdAt : new Date().toISOString()
    })

    console.log('✅ Applicant payment status updated via webhook:', {
      applicantId: applicantId,
      reference: reference,
      status: 'paid'
    })

  } catch (error) {
    console.error('❌ Error handling successful payment:', error)
  }
}

async function handleFailedPayment(data: any) {
  try {
    const metadata = data.metadata
    const reference = data.reference
    const applicantId = metadata?.applicantId

    if (!applicantId) {
      console.error('❌ Missing applicantId in webhook metadata')
      return
    }

    console.log('❌ Processing failed admission payment:', {
      reference: reference,
      applicantId: applicantId,
      amount: data.amount,
      status: data.status,
      gatewayResponse: data.gateway_response
    })

    // Update applicant payment status
    const applicantRef = doc(db, 'admissionApplications', applicantId)
    const paymentDocRef = doc(db, 'admissionPayments', reference)

    // Prepare failed payment record
    const paymentRecord = {
      reference: reference,
      amount: data.amount,
      status: 'failed',
      gatewayResponse: data.gateway_response,
      failedAt: new Date().toISOString(),
      channel: data.channel,
      customerEmail: data.customer?.email,
      metadata: metadata,
      processedAt: new Date().toISOString(),
      paymentType: 'admission_fee',
      event: 'webhook_charge_failed'
    }

    // Update applicant document
    await updateDoc(applicantRef, {
      paymentStatus: 'failed',
      paymentDetails: paymentRecord,
      lastPaymentAttempt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Create/update payment record
    await setDoc(paymentDocRef, {
      ...paymentRecord,
      applicantId: applicantId,
      applicantName: metadata?.applicantName,
      applicantEmail: metadata?.applicantEmail,
      program: metadata?.program,
      level: metadata?.level,
      createdAt: new Date().toISOString()
    })

    console.log('✅ Applicant payment failure recorded:', {
      applicantId: applicantId,
      reference: reference,
      status: 'failed'
    })

  } catch (error) {
    console.error('❌ Error handling failed payment:', error)
  }
}