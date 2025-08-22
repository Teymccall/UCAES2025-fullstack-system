// API endpoint for scholarship disbursement management
import { NextRequest, NextResponse } from 'next/server'
import { scholarshipDisbursementService } from '@/lib/scholarship-disbursement-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      scholarshipId, 
      studentId, 
      totalAmount, 
      academicYear, 
      semester, 
      disbursementPlan = 'semester' 
    } = body

    if (!scholarshipId || !studentId || !totalAmount || !academicYear || !semester) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('📅 Creating disbursement schedule:', {
      scholarshipId,
      studentId,
      totalAmount,
      academicYear,
      semester,
      disbursementPlan
    })

    // Create disbursement schedule
    const schedule = await scholarshipDisbursementService.createDisbursementSchedule(
      scholarshipId,
      studentId,
      totalAmount,
      academicYear,
      semester,
      disbursementPlan
    )

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Disbursement schedule created successfully'
    })

  } catch (error: any) {
    console.error('❌ Error creating disbursement schedule:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create disbursement schedule' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const action = searchParams.get('action')

    if (action === 'summary' && studentId) {
      // Get disbursement summary for a student
      const summary = await scholarshipDisbursementService.getStudentDisbursementSummary(studentId)
      
      return NextResponse.json({
        success: true,
        data: summary
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request parameters' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('❌ Error getting disbursement data:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to get disbursement data' },
      { status: 500 }
    )
  }
}

// Process pending disbursements (can be called by cron job)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, academicYear, semester } = body

    if (action === 'process-pending' && academicYear && semester) {
      console.log(`🔄 Processing pending disbursements for ${academicYear} - ${semester}`)
      
      await scholarshipDisbursementService.processPendingDisbursements(academicYear, semester)
      
      return NextResponse.json({
        success: true,
        message: 'Pending disbursements processed successfully'
      })
    }

    if (action === 'process-single') {
      const { disbursementId } = body
      
      if (!disbursementId) {
        return NextResponse.json(
          { success: false, error: 'Disbursement ID is required' },
          { status: 400 }
        )
      }

      console.log(`🔄 Processing single disbursement: ${disbursementId}`)
      
      await scholarshipDisbursementService.processSingleDisbursement(disbursementId)
      
      return NextResponse.json({
        success: true,
        message: 'Disbursement processed successfully'
      })
    }

    if (action === 'handle-progression') {
      const { currentYear, newYear } = body
      
      if (!currentYear || !newYear) {
        return NextResponse.json(
          { success: false, error: 'Missing academic year parameters' },
          { status: 400 }
        )
      }

      console.log(`🎓 Handling academic year progression: ${currentYear} → ${newYear}`)
      
      await scholarshipDisbursementService.handleAcademicYearProgression(currentYear, newYear)
      
      return NextResponse.json({
        success: true,
        message: 'Academic year progression handled successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('❌ Error processing disbursement action:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process disbursement action' },
      { status: 500 }
    )
  }
}
