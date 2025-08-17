import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching student progression status...')
    
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
    
    console.log('🏫 Current academic year:', currentAcademicYear)
    
    // Get all active students
    const studentsRef = adminDb.collection('student-registrations')
    const studentsQuery = studentsRef.where('status', '==', 'active')
    const studentsSnapshot = await studentsQuery.get()
    
    // Count students by type and level
    let regularStudents = 0
    let weekendStudents = 0
    let eligibleRegularStudents = 0
    let eligibleWeekendStudents = 0
    
    const studentsByLevel: Record<string, number> = {}
    
    studentsSnapshot.forEach((doc) => {
      const student = doc.data()
      const scheduleType = student.scheduleType || 'Regular'
      const currentLevel = parseInt(student.currentLevel?.replace(/\D/g, '') || '100')
      
      // Count by type
      if (scheduleType.toLowerCase().includes('weekend')) {
        weekendStudents++
        // Weekend students eligible if level < 400 (4 years max)
        if (currentLevel < 400) {
          eligibleWeekendStudents++
        }
      } else {
        regularStudents++
        // Regular students eligible if level < 400 (4 years max)
        if (currentLevel < 400) {
          eligibleRegularStudents++
        }
      }
      
      // Count by level
      const levelKey = `Level ${currentLevel}`
      studentsByLevel[levelKey] = (studentsByLevel[levelKey] || 0) + 1
    })
    
    console.log('📊 Student counts:', {
      regular: regularStudents,
      weekend: weekendStudents,
      eligibleRegular: eligibleRegularStudents,
      eligibleWeekend: eligibleWeekendStudents,
      byLevel: studentsByLevel
    })
    
    // Calculate next progression dates (simplified - typically Sep 1 for Regular, Oct 1 for Weekend)
    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Regular students: Next September 1st
    const nextRegularProgression = new Date(currentYear, 8, 1) // September = month 8
    if (nextRegularProgression <= now) {
      nextRegularProgression.setFullYear(currentYear + 1)
    }
    
    // Weekend students: Next October 1st
    const nextWeekendProgression = new Date(currentYear, 9, 1) // October = month 9
    if (nextWeekendProgression <= now) {
      nextWeekendProgression.setFullYear(currentYear + 1)
    }
    
    const regularDaysUntil = Math.ceil((nextRegularProgression.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const weekendDaysUntil = Math.ceil((nextWeekendProgression.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Check system health (basic checks)
    const systemHealth = {
      healthy: true,
      issues: [] as string[]
    }
    
    // Check if academic year is set
    if (!currentAcademicYear) {
      systemHealth.healthy = false
      systemHealth.issues.push('No current academic year set')
    }
    
    const response = {
      success: true,
      data: {
        currentAcademicYear,
        isProgressionSeason: now.getMonth() >= 7 && now.getMonth() <= 9, // Aug-Oct
        activeProgressions: [], // No active progressions for now
        systemHealth,
        studentCounts: {
          regular: {
            total: regularStudents,
            eligible: eligibleRegularStudents,
            nextProgressionDate: nextRegularProgression.toISOString(),
            daysUntil: regularDaysUntil
          },
          weekend: {
            total: weekendStudents,
            eligible: eligibleWeekendStudents,
            nextProgressionDate: nextWeekendProgression.toISOString(),
            daysUntil: weekendDaysUntil
          }
        },
        studentsByLevel
      }
    }
    
    console.log('✅ Student progression status retrieved successfully')
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Error fetching progression status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progression status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}






