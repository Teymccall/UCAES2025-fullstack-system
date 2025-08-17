import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicantId = searchParams.get('applicantId')
    const reference = searchParams.get('reference')

    if (!applicantId) {
      return NextResponse.json(
        { success: false, message: 'Applicant ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Checking admission payment status for:', { applicantId, reference });

    // Get applicant data
    const applicantRef = doc(db, 'admissionApplications', applicantId)
    const applicantDoc = await getDoc(applicantRef)

    if (!applicantDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Applicant not found' },
        { status: 404 }
      )
    }

    const applicantData = applicantDoc.data()
    
    // If reference is provided, also check payment record
    let paymentDetails = null
    if (reference) {
      const paymentRef = doc(db, 'admissionPayments', reference)
      const paymentDoc = await getDoc(paymentRef)
      
      if (paymentDoc.exists()) {
        paymentDetails = paymentDoc.data()
      }
    }

    // Get latest payment details
    const latestPaymentDetails = applicantData.paymentDetails || {}
    
    // Determine payment status
    let paymentStatus = 'pending'
    let paymentMessage = 'Payment pending'
    
    if (applicantData.paymentStatus === 'paid') {
      paymentStatus = 'completed'
      paymentMessage = 'Payment completed successfully'
    } else if (applicantData.paymentStatus === 'failed') {
      paymentStatus = 'failed'
      paymentMessage = 'Payment failed'
    } else if (applicantData.paymentStatus === 'processing') {
      paymentStatus = 'processing'
      paymentMessage = 'Payment processing'
    }

    const response = {
      success: true,
      data: {
        applicantId: applicantId,
        paymentStatus: paymentStatus,
        message: paymentMessage,
        applicationStatus: applicantData.status || 'submitted',
        paymentDetails: latestPaymentDetails,
        specificPaymentDetails: paymentDetails,
        paymentCompletedAt: applicantData.paymentCompletedAt || null,
        lastPaymentAttempt: applicantData.lastPaymentAttempt || null
      }
    }

    console.log('✅ Payment status retrieved:', response.data)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error checking payment status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Optional: POST endpoint to update payment status manually (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicantId, reference, status } = body

    if (!applicantId || !reference || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('📝 Manually updating payment status:', { applicantId, reference, status });

    // Get applicant data
    const applicantRef = doc(db, 'admissionApplications', applicantId)
    const applicantDoc = await getDoc(applicantRef)

    if (!applicantDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Applicant not found' },
        { status: 404 }
      )
    }

    // Update payment status (for testing purposes)
    await updateDoc(applicantRef, {
      paymentStatus: status,
      lastPaymentAttempt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        applicantId: applicantId,
        reference: reference,
        newStatus: status
      }
    })

  } catch (error) {
    console.error('❌ Error updating payment status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}