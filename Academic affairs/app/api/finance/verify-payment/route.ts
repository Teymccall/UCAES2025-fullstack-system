import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      studentId, 
      studentName,
      programme,
      programmeType,
      level,
      ghanaCardNumber,
      amount, 
      paymentMethod, 
      bankName,
      referenceNumber,
      paymentDate,
      paymentTime,
      bankReceiptNumber,
      tellerName,
      branch,
      notes,
      paymentFor,
      selectedServices,
      verifiedBy,
      academicYear,
      semester
    } = body

    // Validate required fields
    if (!studentId || !ghanaCardNumber || !amount || !paymentMethod || !paymentDate || !referenceNumber || !verifiedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, ghanaCardNumber, amount, paymentMethod, paymentDate, referenceNumber, verifiedBy' },
        { status: 400 }
      )
    }

    // Get Firebase admin instance
    const adminDb = getDb()

    // Create detailed description based on payment for and selected services
    let description = `Manual payment verification - ${paymentFor.join(', ')}`
    if (paymentFor.includes('other') && selectedServices && selectedServices.length > 0) {
      // Fetch service names for description
      const serviceNames = []
      for (const serviceId of selectedServices) {
        try {
          const serviceDoc = await adminDb.collection('fee-services').doc(serviceId).get()
          if (serviceDoc.exists()) {
            serviceNames.push(serviceDoc.data()?.name || 'Unknown Service')
          }
        } catch (error) {
          console.error('Error fetching service name:', error)
        }
      }
      if (serviceNames.length > 0) {
        description += ` (Services: ${serviceNames.join(', ')})`
      }
    }

    // Create payment record in student-payments collection
    const paymentRecord = {
      studentId,
      studentName: studentName || '',
      programme: programme || '',
      programmeType: programmeType || 'regular',
      level: level || 100,
      ghanaCardNumber: ghanaCardNumber || '',
      amount: parseInt(amount),
      category: paymentFor.includes('semester1') ? 'semester1' : 
                paymentFor.includes('semester2') ? 'semester2' : 
                paymentFor.includes('other') ? 'services' : 'tuition',
      description,
      status: 'verified',
      paymentMethod,
      bankName: bankName || '',
      accountNumber: '',
      referenceNumber: referenceNumber || '',
      bankReceiptNumber: bankReceiptNumber || '',
      tellerName: tellerName || '',
      branch: branch || '',
      paymentDate,
      paymentTime: paymentTime || '00:00',
      submittedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      verifiedBy,
      notes: notes || '',
      paymentFor,
      selectedServices: selectedServices || [],
      manualEntry: true,
      academicYear: academicYear || '2025/2026',
      semester: semester || (paymentFor.includes('semester1') ? 'First Semester' : 
                             paymentFor.includes('semester2') ? 'Second Semester' : 'Current Semester'),
      paymentPeriod: paymentFor.includes('semester1') ? 'semester1' : 
                     paymentFor.includes('semester2') ? 'semester2' : 'semester1'
    }

    console.log('Creating manual payment record:', paymentRecord)

    // Add payment record to Firestore
    const paymentsRef = adminDb.collection('student-payments')
    const docRef = await paymentsRef.add(paymentRecord)

    console.log('✅ Manual payment record created with ID:', docRef.id)

    // Create verification log entry
    const verificationLog = {
      paymentId: docRef.id,
      studentId,
      amount: parseInt(amount),
      verifiedBy,
      verificationDate: new Date().toISOString(),
      paymentMethod,
      bankName: bankName || '',
      referenceNumber: referenceNumber || '',
      notes: notes || '',
      source: 'manual_verification'
    }

    await adminDb.collection('payment-verifications').add(verificationLog)

    console.log('✅ Verification log created')

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: docRef.id,
      data: paymentRecord
    })

  } catch (error) {
    console.error('❌ Error verifying payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
