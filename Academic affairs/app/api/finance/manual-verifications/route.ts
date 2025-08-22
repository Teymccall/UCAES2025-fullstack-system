import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching manual verification records...')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const academicYear = searchParams.get('academicYear')
    const verifiedBy = searchParams.get('verifiedBy')
    
    const db = getDb()
    
    // Query payment-verifications collection for manual verifications using admin SDK
    let verificationsRef = db.collection('payment-verifications')
      .where('source', '==', 'manual_verification')
      .orderBy('verificationDate', 'desc')
    
    // Add filters if provided
    if (verifiedBy) {
      verificationsRef = db.collection('payment-verifications')
        .where('source', '==', 'manual_verification')
        .where('verifiedBy', '==', verifiedBy)
        .orderBy('verificationDate', 'desc')
    }
    
    const verificationsSnapshot = await verificationsRef.get()
    
    console.log(`📊 Found ${verificationsSnapshot.size} manual verification records`)
    
    // Get all verification records
    const verificationRecords = []
    verificationsSnapshot.docs.forEach((doc) => {
      verificationRecords.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // Now fetch the corresponding payment records for additional details
    const enrichedRecords = []
    
    for (const verification of verificationRecords) {
      try {
        // Fetch the corresponding payment record using admin SDK
        const paymentDoc = await db.collection('student-payments').doc(verification.paymentId).get()
        
        let paymentData = null
        if (paymentDoc.exists) {
          paymentData = {
            id: paymentDoc.id,
            ...paymentDoc.data()
          }
        }
        
        // Combine verification and payment data
        enrichedRecords.push({
          ...verification,
          paymentDetails: paymentData
        })
        
      } catch (error) {
        console.error('Error fetching payment details for verification:', verification.id, error)
        // Include verification record even if payment details fail
        enrichedRecords.push({
          ...verification,
          paymentDetails: null
        })
      }
    }
    
    // Filter by academic year if provided (after enrichment since it's in payment details)
    let filteredRecords = enrichedRecords
    if (academicYear) {
      filteredRecords = enrichedRecords.filter(record => 
        record.paymentDetails?.academicYear === academicYear
      )
    }
    
    // Apply limit
    const limitedRecords = filteredRecords.slice(0, limit)
    
    // Calculate summary statistics
    const totalAmount = limitedRecords.reduce((sum, record) => 
      sum + (record.amount || 0), 0
    )
    
    const uniqueStudents = new Set(limitedRecords.map(record => record.studentId)).size
    
    const verificationsByPeriod = limitedRecords.reduce((acc, record) => {
      const date = new Date(record.verificationDate).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const verificationsByVerifier = limitedRecords.reduce((acc, record) => {
      const verifier = record.verifiedBy || 'Unknown'
      acc[verifier] = (acc[verifier] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('✅ Manual verification records processed successfully')
    
    return NextResponse.json({
      success: true,
      data: {
        verifications: limitedRecords,
        summary: {
          totalRecords: limitedRecords.length,
          totalAmount,
          uniqueStudents,
          verificationsByPeriod,
          verificationsByVerifier
        }
      },
      message: `Found ${limitedRecords.length} manual verification records`
    })
    
  } catch (error) {
    console.error('❌ Error fetching manual verifications:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch manual verification records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
