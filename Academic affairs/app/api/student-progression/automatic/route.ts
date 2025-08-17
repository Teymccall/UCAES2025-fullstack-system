import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

/**
 * Automatic Academic Progression System
 * Handles both semester transitions and academic year progressions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, force = false } = body
    
    // type: 'semester' for semester transitions, 'academic-year' for year progressions
    if (!type || !['semester', 'academic-year'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Must be "semester" or "academic-year"'
      }, { status: 400 })
    }
    
    console.log(`🤖 Starting automatic ${type} progression...`)
    
    // Get Firebase admin instance
    const adminDb = getDb()
    
    // Get current academic period
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
    const currentSemester = systemData?.currentSemester
    
    if (type === 'semester') {
      return await handleSemesterTransition(currentAcademicYear, currentSemester, force)
    } else {
      return await handleAcademicYearProgression(currentAcademicYear, force)
    }
    
  } catch (error) {
    console.error('❌ Error in automatic progression:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to execute automatic progression',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Handle automatic semester transitions (same academic year, same level)
 */
async function handleSemesterTransition(currentAcademicYear: string, currentSemester: string | null, force: boolean) {
  console.log(`📅 Processing semester transition for academic year ${currentAcademicYear}`)
  
  // Get Firebase admin instance
  const adminDb = getDb()
  
  // Get the current academic year ID from systemConfig
  const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod')
  const systemConfigDoc = await systemConfigRef.get()
  const systemData = systemConfigDoc.data()
  const currentAcademicYearId = systemData?.currentAcademicYearId
  
  if (!currentAcademicYearId) {
    return NextResponse.json({
      success: false,
      error: 'No current academic year ID found in system config'
    }, { status: 404 })
  }
  
  // Get all semesters for the current academic year from the director-managed system
  const semestersRef = adminDb.collection('academic-semesters')
  const semestersQuery = semestersRef
    .where('academicYear', '==', currentAcademicYearId)
    .orderBy('number')
  
  const semestersSnapshot = await semestersQuery.get()
  const semesters = semestersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  console.log(`🔍 Found ${semesters.length} semesters for academic year ${currentAcademicYear}`)
  
  // Find current active semester and next semester
  const currentActiveSemester = semesters.find(s => s.status === 'active')
  
  if (!currentActiveSemester && !force) {
    return NextResponse.json({
      success: false,
      error: 'No active semester found',
      details: 'Director must set a semester as active first'
    }, { status: 400 })
  }
  
  // Find next semester based on current semester number and program type
  const currentNumber = parseInt(currentActiveSemester?.number || '1')
  const programType = currentActiveSemester?.programType || 'Regular'
  
  const nextSemester = semesters.find(s => 
    s.programType === programType && 
    parseInt(s.number) === currentNumber + 1 &&
    s.status !== 'active'
  )
  
  if (!nextSemester && !force) {
    return NextResponse.json({
      success: false,
      error: 'No next semester found',
      details: `Current: ${currentActiveSemester?.name} (${programType}), looking for number ${currentNumber + 1}`
    }, { status: 400 })
  }
  
  // Check if it's time for semester transition based on semester end date
  const now = new Date()
  const shouldTransition = force || checkSemesterTransitionByEndDate(now, currentActiveSemester)
  
  if (!shouldTransition && !force) {
    return NextResponse.json({
      success: false,
      message: 'Not yet time for semester transition',
      details: `Current semester ends: ${currentActiveSemester?.endDate?.toDate?.()?.toDateString() || 'Unknown'}`,
      nextTransitionDate: currentActiveSemester?.endDate?.toDate?.()?.toISOString()
    })
  }
  
  // Perform the transition: mark current as completed, next as active
  if (currentActiveSemester) {
    await semestersRef.doc(currentActiveSemester.id).update({
      status: 'completed',
      lastUpdated: new Date()
    })
  }
  
  if (nextSemester) {
    await semestersRef.doc(nextSemester.id).update({
      status: 'active',
      lastUpdated: new Date()
    })
  }
  
  // Update centralized semester
  await systemConfigRef.update({
    currentSemesterId: nextSemester?.id || null,
    currentSemester: nextSemester?.name || null,
    lastUpdated: new Date(),
    updatedBy: 'automatic-semester-transition'
  })
  
  console.log(`✅ Semester transitioned: ${currentActiveSemester?.name} → ${nextSemester?.name}`)
  
  return NextResponse.json({
    success: true,
    type: 'semester-transition',
    previousSemester: currentActiveSemester?.name || currentSemester,
    newSemester: nextSemester?.name || 'Unknown',
    academicYear: currentAcademicYear,
    programType: programType,
    message: `Automatically transitioned to ${nextSemester?.name || 'next semester'}`
  })
}

/**
 * Handle automatic academic year progression (new year + level progression)
 */
async function handleAcademicYearProgression(currentAcademicYear: string, force: boolean) {
  console.log(`🎓 Processing academic year progression from ${currentAcademicYear}`)
  
  // Get Firebase admin instance
  const adminDb = getDb()
  
  // Get current academic year from the director-managed system
  const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod')
  const systemConfigDoc = await systemConfigRef.get()
  const systemData = systemConfigDoc.data()
  const currentAcademicYearId = systemData?.currentAcademicYearId
  
  if (!currentAcademicYearId) {
    return NextResponse.json({
      success: false,
      error: 'No current academic year ID found in system config'
    }, { status: 404 })
  }
  
  // Get current academic year details
  const currentYearRef = adminDb.collection('academic-years').doc(currentAcademicYearId)
  const currentYearDoc = await currentYearRef.get()
  
  if (!currentYearDoc.exists) {
    return NextResponse.json({
      success: false,
      error: 'Current academic year document not found'
    }, { status: 404 })
  }
  
  const currentYearData = currentYearDoc.data()
  
  // Check if it's time for academic year progression based on academic year end date
  const now = new Date()
  const shouldProgress = force || checkAcademicYearProgressionByEndDate(now, currentYearData)
  
  if (!shouldProgress && !force) {
    return NextResponse.json({
      success: false,
      message: 'Not yet time for academic year progression',
      details: `Current academic year ends: ${currentYearData?.endDate?.toDate?.()?.toDateString() || 'Unknown'}`,
      nextProgressionDate: currentYearData?.endDate?.toDate?.()?.toISOString()
    })
  }
  
  // Look for next academic year in the system
  const allYearsRef = adminDb.collection('academic-years')
  const allYearsSnapshot = await allYearsRef.get()
  const allYears = allYearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  // Find next year (by year string)
  const currentYearString = currentYearData?.year || currentAcademicYear
  const yearParts = currentYearString.split('/')
  const nextAcademicYear = yearParts.length === 2 
    ? `${parseInt(yearParts[0]) + 1}/${parseInt(yearParts[1]) + 1}`
    : currentYearString
    
  let nextYear = allYears.find(y => y.year === nextAcademicYear)
  
  // If next year doesn't exist, we need to create it or fail
  if (!nextYear && !force) {
    return NextResponse.json({
      success: false,
      error: 'Next academic year not found in system',
      details: `Looking for academic year: ${nextAcademicYear}. Director must create it first.`
    }, { status: 400 })
  }
  
  // If we have next year, proceed with progression
  if (nextYear) {
    // Mark current year as completed and next year as active
    await currentYearRef.update({
      status: 'completed',
      lastUpdated: new Date()
    })
    
    await allYearsRef.doc(nextYear.id).update({
      status: 'active',
      lastUpdated: new Date()
    })
  }
  
  // Get all active students
  const studentsRef = adminDb.collection('student-registrations')
  const studentsQuery = studentsRef.where('status', '==', 'active')
  const studentsSnapshot = await studentsQuery.get()
  
  let studentsProcessed = 0
  let successfulProgressions = 0
  let failedProgressions = 0
  const progressionResults: any[] = []
  
  // Process each student for level progression
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
        // Update the student record
        await studentDoc.ref.update({
          currentLevel: newLevel.toString(),
          currentAcademicYear: nextAcademicYear,
          lastProgressionDate: new Date(),
          lastUpdated: new Date()
        })
        
        console.log(`✅ Auto-progressed ${studentId}: Level ${currentLevel} → ${newLevel}`)
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
  
  // Update centralized academic year and reset to first semester
  if (nextYear) {
    // Find the first semester of the new academic year
    const newYearSemestersRef = adminDb.collection('academic-semesters')
    const newYearSemestersQuery = newYearSemestersRef
      .where('academicYear', '==', nextYear.id)
      .where('number', '==', '1')
      .limit(1)
    
    const newYearSemestersSnapshot = await newYearSemestersQuery.get()
    let firstSemester = null
    
    if (!newYearSemestersSnapshot.empty) {
      firstSemester = { id: newYearSemestersSnapshot.docs[0].id, ...newYearSemestersSnapshot.docs[0].data() }
      
      // Set first semester as active
      await newYearSemestersRef.doc(firstSemester.id).update({
        status: 'active',
        lastUpdated: new Date()
      })
    }
    
    await systemConfigRef.update({
      currentAcademicYearId: nextYear.id,
      currentAcademicYear: nextAcademicYear,
      currentSemesterId: firstSemester?.id || null,
      currentSemester: firstSemester?.name || 'First Semester',
      lastUpdated: new Date(),
      updatedBy: 'automatic-year-progression'
    })
  }
  
  console.log(`✅ Academic year progressed: ${currentAcademicYear} → ${nextAcademicYear}`)
  console.log(`📊 Students processed: ${studentsProcessed}, successful: ${successfulProgressions}, failed: ${failedProgressions}`)
  
  return NextResponse.json({
    success: true,
    type: 'academic-year-progression',
    previousAcademicYear: currentAcademicYear,
    newAcademicYear: nextAcademicYear,
    studentsProcessed,
    successfulProgressions,
    failedProgressions,
    results: progressionResults,
    message: `Automatically progressed to academic year ${nextAcademicYear}`
  })
}

/**
 * Check if it's time for semester transition based on semester end date
 */
function checkSemesterTransitionByEndDate(now: Date, currentSemester: any): boolean {
  if (!currentSemester?.endDate) {
    console.log('⚠️ No end date set for current semester')
    return false
  }
  
  const endDate = currentSemester.endDate.toDate ? currentSemester.endDate.toDate() : new Date(currentSemester.endDate)
  const daysBeyondEnd = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
  
  console.log(`📅 Semester end date: ${endDate.toDateString()}, Days beyond end: ${daysBeyondEnd}`)
  
  // Transition if we're past the end date (with a small grace period)
  return daysBeyondEnd >= 0
}

/**
 * Check if it's time for academic year progression based on academic year end date
 */
function checkAcademicYearProgressionByEndDate(now: Date, currentYear: any): boolean {
  if (!currentYear?.endDate) {
    console.log('⚠️ No end date set for current academic year')
    return false
  }
  
  const endDate = currentYear.endDate.toDate ? currentYear.endDate.toDate() : new Date(currentYear.endDate)
  const daysBeyondEnd = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
  
  console.log(`📅 Academic year end date: ${endDate.toDateString()}, Days beyond end: ${daysBeyondEnd}`)
  
  // Transition if we're past the end date (with a small grace period)
  return daysBeyondEnd >= 0
}
