import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

// Paystack configuration for admission system
const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_ff88b6c8cbc25c8447397fe2600511f2aa704c59',
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_c79226fde749dfd7bf30cf15dfcea04cfb617888',
  currency: 'GHS',
  applicationFee: 20000, // GHS 200 in pesewas
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Admission payment initialization request received');
    
    const body = await request.json()
    console.log('📥 Request body:', JSON.stringify(body, null, 2));
    
    const { 
      applicantId, 
      applicantName, 
      applicantEmail, 
      applicantPhone,
      program,
      level,
      amount,
      callbackUrl 
    } = body

    // Validate required fields
    if (!applicantId || !applicantName || !applicantEmail || !program || !level) {
      console.log('❌ Missing required fields:', { 
        applicantId, 
        applicantName, 
        applicantEmail, 
        program, 
        level 
      });
      return NextResponse.json(
        { success: false, message: 'Missing required applicant information', 
          issues: [
            !applicantId && 'applicantId is required',
            !applicantName && 'applicantName is required',
            !applicantEmail && 'applicantEmail is required',
            !program && 'program is required',
            !level && 'level is required'
          ].filter(Boolean)
        },
        { status: 400 }
      )
    }

    // Use default admission fee if amount not provided
    const paymentAmount = amount || paystackConfig.applicationFee

    // Validate email format and ensure it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = applicantEmail.trim()
    if (!emailRegex.test(trimmedEmail)) {
      console.log('❌ Invalid email format:', trimmedEmail);
      return NextResponse.json(
        { success: false, message: 'Invalid email format', issues: ['Invalid email format'] },
        { status: 400 }
      )
    }

    // Validate phone number if provided (ensure it's a string and not empty)
    const phoneNumber = applicantPhone ? String(applicantPhone).trim() : ''
    
    // Ensure amount is a positive integer (in pesewas)
    if (typeof paymentAmount !== 'number' || paymentAmount <= 0) {
      console.log('❌ Invalid amount:', paymentAmount);
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount', issues: ['Amount must be a positive number'] },
        { status: 400 }
      )
    }

    // Generate unique reference for this admission payment
    const reference = `ADM-${applicantId}-${Date.now()}`

    // Prepare Paystack request data with proper formatting
    const paystackRequestData = {
      amount: Math.round(paymentAmount), // Ensure integer
      email: trimmedEmail,
      reference: reference,
      callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admission/payment/callback`,
      metadata: {
        applicantId: String(applicantId).trim(),
        applicantName: String(applicantName).trim(),
        applicantEmail: trimmedEmail,
        applicantPhone: phoneNumber,
        program: String(program).trim(),
        level: String(level).trim(),
        paymentType: 'admission_fee',
        academicYear: '2024/2025',
        paymentDescription: 'UCAES Admission Application Fee'
      },
      currency: paystackConfig.currency,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    };
    
    // Remove any undefined values
    Object.keys(paystackRequestData.metadata).forEach(key => {
      if (paystackRequestData.metadata[key] === undefined || paystackRequestData.metadata[key] === null) {
        paystackRequestData.metadata[key] = '';
      }
    });
    
    console.log('📤 Paystack request data:', JSON.stringify(paystackRequestData, null, 2));
    
    // Call Paystack API to initialize payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackRequestData),
    })

    console.log('📥 Paystack response status:', paystackResponse.status);
    
    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json()
      console.error('❌ Paystack API error:', errorData)
      
      // Extract specific validation issues from Paystack response
      const issues = errorData.errors || errorData.data?.errors || []
      const errorMessage = errorData.message || 'Failed to initialize payment'
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          issues: issues.length > 0 ? issues : [errorMessage],
          paystackError: errorData
        },
        { status: paystackResponse.status }
      )
    }

    const paystackData = await paystackResponse.json()

    if (paystackData.status && paystackData.data) {
      try {
        // Create payment record in Firebase
        const paymentRecord = {
          applicantId,
          applicantName,
          applicantEmail,
          applicantPhone: applicantPhone || null,
          program,
          level,
          amount: paymentAmount,
          reference,
          status: 'pending',
          paymentType: 'admission_fee',
          academicYear: '2024/2025',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          authorizationUrl: paystackData.data.authorization_url,
          accessCode: paystackData.data.access_code,
          metadata: {
            paystackResponse: paystackData.data,
            requestData: paystackRequestData
          }
        }

        // Store in admissionPayments collection
        await setDoc(doc(db, 'admissionPayments', reference), paymentRecord)
        
        // Update applicant record with payment reference
        const applicantRef = doc(db, 'admissionApplications', applicantId)
        const applicantDoc = await getDoc(applicantRef)
        
        if (applicantDoc.exists()) {
          await updateDoc(applicantRef, {
            paymentReference: reference,
            paymentStatus: 'pending',
            updatedAt: serverTimestamp()
          })
        }

        console.log('✅ Admission payment initialized successfully:', {
          reference: reference,
          amount: paymentAmount,
          email: applicantEmail,
          authorizationUrl: paystackData.data.authorization_url
        })

        return NextResponse.json({
          success: true,
          message: 'Admission payment initialized successfully',
          data: {
            authorizationUrl: paystackData.data.authorization_url,
            reference: reference,
            accessCode: paystackData.data.access_code
          }
        })
      } catch (firebaseError) {
        console.error('❌ Firebase error:', firebaseError)
        // Continue with response even if Firebase fails - payment is still initialized
        return NextResponse.json({
          success: true,
          message: 'Payment initialized (Firebase sync may have failed)',
          data: {
            authorizationUrl: paystackData.data.authorization_url,
            reference: reference,
            accessCode: paystackData.data.access_code
          }
        })
      }
    } else {
      throw new Error('Invalid response from Paystack')
    }

  } catch (error) {
    console.error('❌ Admission payment initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}