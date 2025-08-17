import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

/**
 * Automatic Progression Scheduler
 * This endpoint should be called by a cron job or similar scheduler
 * to check and execute automatic progressions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheduleType, isDryRun = true } = body
    
    console.log(`🚀 ${isDryRun ? 'Dry run' : 'Executing'} progression for ${scheduleType} students...`)
    
    if (!scheduleType || !['Regular', 'Weekend'].includes(scheduleType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid schedule type. Must be "Regular" or "Weekend"'
      }, { status: 400 })
    }
    
    // Get Firebase admin instance
    const adminDb = getDb()
    
    const results = {
      timestamp: new Date().toISOString(),
      semesterTransition: null as any,
      academicYearProgression: null as any,
      actionsPerformed: [] as string[]
    }
    
    // Check for semester transitions
    console.log('📅 Checking for semester transitions...')
    const semesterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/student-progression/automatic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'semester', force: false })
    })
    
    const semesterResult = await semesterResponse.json()
    
    if (semesterResult.success) {
      results.semesterTransition = semesterResult
      results.actionsPerformed.push(`Semester transition: ${semesterResult.previousSemester} → ${semesterResult.newSemester}`)
      console.log('✅ Automatic semester transition completed')
    } else if (semesterResult.message?.includes('Not yet time')) {
      console.log('⏳ Not yet time for semester transition')
      results.semesterTransition = { skipped: true, reason: semesterResult.message }
    } else {
      console.log('❌ Semester transition failed:', semesterResult.error)
      results.semesterTransition = { failed: true, error: semesterResult.error }
    }
    
    // Check for academic year progressions
    console.log('🎓 Checking for academic year progressions...')
    const yearResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/student-progression/automatic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'academic-year', force: false })
    })
    
    const yearResult = await yearResponse.json()
    
    if (yearResult.success) {
      results.academicYearProgression = yearResult
      results.actionsPerformed.push(`Academic year progression: ${yearResult.previousAcademicYear} → ${yearResult.newAcademicYear}`)
      results.actionsPerformed.push(`Students progressed: ${yearResult.successfulProgressions}/${yearResult.studentsProcessed}`)
      console.log('✅ Automatic academic year progression completed')
    } else if (yearResult.message?.includes('Not yet time')) {
      console.log('⏳ Not yet time for academic year progression')
      results.academicYearProgression = { skipped: true, reason: yearResult.message }
    } else {
      console.log('❌ Academic year progression failed:', yearResult.error)
      results.academicYearProgression = { failed: true, error: yearResult.error }
    }
    
    // Log the scheduler run to Firebase for audit trail
    await logSchedulerRun(results)
    
    const hasActions = results.actionsPerformed.length > 0
    
    return NextResponse.json({
      success: true,
      message: hasActions 
        ? `Scheduler completed with ${results.actionsPerformed.length} actions`
        : 'Scheduler completed - no actions needed',
      results,
      hasActions
    })
    
  } catch (error) {
    console.error('❌ Error in progression scheduler:', error)
    
    // Log the error
    await logSchedulerRun({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      actionsPerformed: []
    })
    
    return NextResponse.json({
      success: false,
      error: 'Scheduler failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Manual trigger endpoint - for testing or emergency use
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'
    const type = url.searchParams.get('type') // 'semester' or 'academic-year' or 'both'
    
    console.log(`🔧 Manual scheduler trigger - force: ${force}, type: ${type}`)
    
    if (!type || !['semester', 'academic-year', 'both'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type parameter. Must be "semester", "academic-year", or "both"'
      }, { status: 400 })
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      manual: true,
      force,
      semesterTransition: null as any,
      academicYearProgression: null as any,
      actionsPerformed: [] as string[]
    }
    
    // Handle semester transition
    if (type === 'semester' || type === 'both') {
      const semesterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/student-progression/automatic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'semester', force })
      })
      
      const semesterResult = await semesterResponse.json()
      results.semesterTransition = semesterResult
      
      if (semesterResult.success) {
        results.actionsPerformed.push(`Manual semester transition: ${semesterResult.previousSemester} → ${semesterResult.newSemester}`)
      }
    }
    
    // Handle academic year progression
    if (type === 'academic-year' || type === 'both') {
      const yearResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/student-progression/automatic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'academic-year', force })
      })
      
      const yearResult = await yearResponse.json()
      results.academicYearProgression = yearResult
      
      if (yearResult.success) {
        results.actionsPerformed.push(`Manual academic year progression: ${yearResult.previousAcademicYear} → ${yearResult.newAcademicYear}`)
        results.actionsPerformed.push(`Students progressed: ${yearResult.successfulProgressions}/${yearResult.studentsProcessed}`)
      }
    }
    
    // Log the manual run
    await logSchedulerRun(results)
    
    return NextResponse.json({
      success: true,
      message: `Manual trigger completed with ${results.actionsPerformed.length} actions`,
      results
    })
    
  } catch (error) {
    console.error('❌ Error in manual scheduler trigger:', error)
    return NextResponse.json({
      success: false,
      error: 'Manual trigger failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Log scheduler runs for audit trail
 */
async function logSchedulerRun(results: any) {
  try {
    const logsRef = adminDb.collection('system-logs').doc('progression-scheduler')
    const logEntry = {
      timestamp: results.timestamp,
      results,
      loggedAt: new Date()
    }
    
    // Get existing logs
    const logsDoc = await logsRef.get()
    const existingLogs = logsDoc.exists ? logsDoc.data()?.runs || [] : []
    
    // Add new log entry and keep only last 100 runs
    existingLogs.unshift(logEntry)
    const trimmedLogs = existingLogs.slice(0, 100)
    
    await logsRef.set({
      lastRun: results.timestamp,
      totalRuns: (logsDoc.data()?.totalRuns || 0) + 1,
      runs: trimmedLogs
    }, { merge: true })
    
    console.log('📝 Scheduler run logged successfully')
  } catch (error) {
    console.error('❌ Failed to log scheduler run:', error)
    // Don't fail the main operation for logging issues
  }
}






