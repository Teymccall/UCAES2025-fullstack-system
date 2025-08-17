import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, action, targetLevel, targetAcademicYear, force = false } = body
    
    // Get Firebase admin instance
    const adminDb = getDb()
    
    // Get current academic year from centralized system
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod')
    const systemConfigDoc = await systemConfigRef.get()
    
    if (!systemConfigDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'No centralized academic period found'
      }, { status: 404 })
    }
    
    const systemData = systemConfigDoc.data()
    const currentAcademicYear = systemData?.currentAcademicYear || '2024/2025'
    
    // Calculate next academic year
    const yearParts = currentAcademicYear.split('/')
    const nextAcademicYear = yearParts.length === 2 
      ? `${parseInt(yearParts[0]) + 1}/${parseInt(yearParts[1]) + 1}`
      : currentAcademicYear
    
    console.log(`📅 Transitioning from ${currentAcademicYear} to ${nextAcademicYear}`)
    
    // Get students for the specified schedule type
    const studentsRef = adminDb.collection('student-registrations')
    let studentsQuery = studentsRef.where('status', '==', 'active')
    
    // Filter by schedule type
    if (scheduleType === 'Weekend') {
      studentsQuery = studentsQuery.where('scheduleType', '==', 'Weekend')
    } else {
      // Regular students (default or explicitly Regular)
      studentsQuery = studentsQuery.where('scheduleType', 'in', ['Regular', null])
    }
    
    const studentsSnapshot = await studentsQuery.get()
    
    console.log(`📊 Found ${studentsSnapshot.size} ${scheduleType} students to process`)
    
    let studentsProcessed = 0
    let successfulProgressions = 0
    let failedProgressions = 0
    const progressionResults: any[] = []
    
    // Process each student
    for (const studentDoc of studentsSnapshot.docs) {
      try {
        const student = studentDoc.data()
        const studentId = student.registrationNumber || student.studentIndexNumber || studentDoc.id
        
        // Get current level
        const currentLevelStr = student.currentLevel || '100'
        const currentLevel = parseInt(currentLevelStr.replace(/\D/g, '')) || 100
        
        // Check if student can progress (not at max level)
        const maxLevel = 400 // 4-year programs
        let newLevel = currentLevel
        let shouldProgress = false
        
        if (currentLevel < maxLevel) {
          newLevel = currentLevel + 100 // Level 100 -> 200, 200 -> 300, etc.
          shouldProgress = true
        }
        
        const result = {
          studentId,
          name: `${student.surname || ''} ${student.otherNames || ''}`.trim(),
          registrationNumber: student.registrationNumber,
          oldLevel: currentLevel,
          newLevel,
          oldAcademicYear: student.currentAcademicYear || currentAcademicYear,
          newAcademicYear: nextAcademicYear,
          shouldProgress,
          processed: false,
          error: null as string | null
        }
        
        studentsProcessed++
        
        if (shouldProgress) {
          if (!isDryRun) {
            // Actually update the student record
            await studentDoc.ref.update({
              currentLevel: newLevel.toString(),
              currentAcademicYear: nextAcademicYear,
              lastProgressionDate: new Date(),
              lastUpdated: new Date()
            })
            
            console.log(`✅ Progressed ${studentId}: Level ${currentLevel} → ${newLevel}`)
          } else {
            console.log(`🔍 Would progress ${studentId}: Level ${currentLevel} → ${newLevel}`)
          }
          
          result.processed = true
          successfulProgressions++
        } else {
          result.error = `Student already at maximum level (${currentLevel})`
          console.log(`⚠️ Skipped ${studentId}: Already at max level ${currentLevel}`)
        }
        
        progressionResults.push(result)
        
      } catch (studentError) {
        console.error(`❌ Error processing student ${studentDoc.id}:`, studentError)
        failedProgressions++
        
        progressionResults.push({
          studentId: studentDoc.id,
          name: 'Unknown',
          error: studentError instanceof Error ? studentError.message : 'Unknown error',
          processed: false
        })
      }
    }
    
    // If not a dry run and we have progressions, update the academic year
    if (!isDryRun && successfulProgressions > 0) {
      try {
        // Update centralized academic year
        await systemConfigRef.update({
          currentAcademicYear: nextAcademicYear,
          lastUpdated: new Date(),
          updatedBy: 'system-progression'
        })
        
        console.log(`✅ Updated centralized academic year to ${nextAcademicYear}`)
      } catch (yearUpdateError) {
        console.error('❌ Failed to update centralized academic year:', yearUpdateError)
        // Don't fail the entire operation for this
      }
    }
    
    const summary = {
      success: true,
      isDryRun,
      scheduleType,
      currentAcademicYear,
      nextAcademicYear,
      studentsProcessed,
      successfulProgressions,
      failedProgressions,
      results: progressionResults
    }
    
    console.log(`✅ Progression ${isDryRun ? 'dry run' : 'execution'} completed:`, {
      processed: studentsProcessed,
      successful: successfulProgressions,
      failed: failedProgressions
    })
    
    return NextResponse.json(summary)
    
  } catch (error) {
    console.error('❌ Error executing student progression:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute student progression',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}






