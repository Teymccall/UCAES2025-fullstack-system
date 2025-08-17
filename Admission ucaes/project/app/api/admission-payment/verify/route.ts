import { NextRequest, NextResponse } from 'next/server'
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

// Paystack configuration
const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_ff88b6c8cbc25c8447397fe2600511f2aa704c59',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Reference is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Verifying admission payment with reference:', reference);

    // Call Paystack API to verify payment
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      console.error('❌ Paystack verification error:', errorData)
      return NextResponse.json(
        { success: false, message: errorData.message || 'Failed to verify payment' },
        { status: paystackResponse.status }
      )
    }

    const paystackData = await paystackResponse.json()

    if (paystackData.status && paystackData.data) {
      const paymentData = paystackData.data
      
      // Log verification result
      console.log('✅ Payment verification successful:', {
        reference: reference,
        status: paymentData.status,
        amount: paymentData.amount,
        gateway_response: paymentData.gateway_response,
        paid_at: paymentData.paid_at,
        customer: paymentData.customer
      })

      // Extract applicant information from metadata
      const metadata = paymentData.metadata
      const applicantId = metadata?.applicantId
      
      if (!applicantId) {
        console.error('❌ Missing applicantId in payment metadata')
        return NextResponse.json(
          { success: false, message: 'Missing applicant information in payment' },
          { status: 400 }
        )
      }

      // Update applicant payment status in Firebase
      try {
        const applicantRef = doc(db, 'admissionApplications', applicantId)
        const applicantDoc = await getDoc(applicantRef)

        if (!applicantDoc.exists()) {
          console.error('❌ Applicant not found:', applicantId)
          return NextResponse.json(
            { success: false, message: 'Applicant not found' },
            { status: 404 }
          )
        }

        // Prepare payment record
        const paymentRecord = {
          reference: reference,
          amount: paymentData.amount,
          status: paymentData.status,
          gatewayResponse: paymentData.gateway_response,
          paidAt: paymentData.paid_at,
          channel: paymentData.channel,
          customerEmail: paymentData.customer?.email,
          customerCode: paymentData.customer?.customer_code,
          metadata: metadata,
          verifiedAt: new Date().toISOString(),
          paymentType: 'admission_fee'
        }

        // Update applicant document
        await updateDoc(applicantRef, {
          paymentStatus: paymentData.status === 'success' ? 'paid' : 'failed',
          paymentDetails: paymentRecord,
          lastPaymentAttempt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        // Create payment record in payments collection
        const paymentDocRef = doc(db, 'admissionPayments', reference)
        await setDoc(paymentDocRef, {
          ...paymentRecord,
          applicantId: applicantId,
          applicantName: metadata?.applicantName,
          applicantEmail: metadata?.applicantEmail,
          program: metadata?.program,
          level: metadata?.level,
          createdAt: new Date().toISOString()
        })

        console.log('✅ Applicant payment status updated:', {
          applicantId: applicantId,
          newStatus: paymentData.status === 'success' ? 'paid' : 'failed'
        })

        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            reference: reference,
            status: paymentData.status,
            amount: paymentData.amount,
            applicantId: applicantId,
            paymentRecord: paymentRecord
          }
        })

      } catch (firebaseError) {
        console.error('❌ Firebase update error:', firebaseError)
        return NextResponse.json(
          { 
            success: false, 
            message: 'Payment verified but failed to update applicant record',
            error: firebaseError instanceof Error ? firebaseError.message : 'Database error'
          },
          { status: 500 }
        )
      }

    } else {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}