// Service to fetch current academic year and semester from Academic Affairs Firebase
import { db } from './firebase'
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore'

export interface AcademicPeriod {
  academicYear: string
  academicYearId: string
  currentSemester?: {
    id: string
    name: string
    programType: 'Regular' | 'Weekend'
    number: string
    status: 'active' | 'completed' | 'upcoming'
  }
  regularSemester?: {
    id: string
    name: string
    number: string
    status: 'active' | 'completed' | 'upcoming'
  }
  weekendSemester?: {
    id: string
    name: string
    number: string
    status: 'active' | 'completed' | 'upcoming'
  }
}

/**
 * Get current academic year and active semesters from Academic Affairs Firebase
 */
export async function getCurrentAcademicPeriod(): Promise<AcademicPeriod | null> {
  try {
    console.log('🔍 Fetching current academic period from Academic Affairs...')
    
    // 1. Get the active academic year
    const academicYearsRef = collection(db, 'academic-years')
    const activeYearQuery = query(
      academicYearsRef,
      where('status', '==', 'active'),
      limit(1)
    )
    const yearSnapshot = await getDocs(activeYearQuery)
    
    if (yearSnapshot.empty) {
      console.warn('⚠️ No active academic year found')
      return null
    }
    
    const activeYearDoc = yearSnapshot.docs[0]
    const activeYear = activeYearDoc.data()
    
    console.log('✅ Found active academic year:', activeYear.year)
    
    // 2. Get active semesters for this academic year
    const semestersRef = collection(db, 'academic-semesters')
    const activeSemestersQuery = query(
      semestersRef,
      where('academicYear', '==', activeYear.year),
      where('status', '==', 'active')
    )
    const semesterSnapshot = await getDocs(activeSemestersQuery)
    
    const result: AcademicPeriod = {
      academicYear: activeYear.year,
      academicYearId: activeYearDoc.id
    }
    
    // Process active semesters
    semesterSnapshot.docs.forEach(semesterDoc => {
      const semester = semesterDoc.data()
      const semesterInfo = {
        id: semesterDoc.id,
        name: semester.name,
        number: semester.number,
        status: semester.status
      }
      
      if (semester.programType === 'Regular') {
        result.regularSemester = semesterInfo
        if (!result.currentSemester) {
          result.currentSemester = {
            ...semesterInfo,
            programType: 'Regular'
          }
        }
      } else if (semester.programType === 'Weekend') {
        result.weekendSemester = semesterInfo
        if (!result.currentSemester) {
          result.currentSemester = {
            ...semesterInfo,
            programType: 'Weekend'
          }
        }
      }
    })
    
    console.log('🎯 Academic period details:', {
      year: result.academicYear,
      regularSemester: result.regularSemester?.name,
      weekendSemester: result.weekendSemester?.name,
      currentSemester: result.currentSemester?.name
    })
    
    return result
    
  } catch (error) {
    console.error('❌ Error fetching academic period:', error)
    return null
  }
}

/**
 * Get academic period dates for fee calculation
 */
export async function getAcademicPeriodDates(
  academicYear: string,
  programmeType: 'regular' | 'weekend'
): Promise<{
  semester1?: { startDate: string; endDate: string }
  semester2?: { startDate: string; endDate: string }
  trimester1?: { startDate: string; endDate: string }
  trimester2?: { startDate: string; endDate: string }
  trimester3?: { startDate: string; endDate: string }
  defaultSemester1Due?: string
  defaultSemester2Due?: string
  defaultTrimester1Due?: string
  defaultTrimester2Due?: string
  defaultTrimester3Due?: string
} | null> {
  try {
    const academicPeriod = await getCurrentAcademicPeriod()
    if (!academicPeriod) {
      console.warn('⚠️ No academic period found, using calculated dates')
      return calculateDefaultDates(academicYear)
    }

    // Get all semesters for the current academic year
    const semestersQuery = query(
      collection(db, 'academic-semesters'),
      where('academicYear', '==', academicPeriod.academicYearId)
    )
    const semestersSnapshot = await getDocs(semestersQuery)
    
    const result: any = {}
    
    semestersSnapshot.forEach((doc) => {
      const semester = doc.data()
      const semesterType = semester.programType?.toLowerCase() || 'regular'
      const semesterNumber = semester.number || '1'
      
      if (semesterType === programmeType) {
        const startDate = semester.startDate?.toDate?.()?.toISOString()?.split('T')[0] || ''
        const endDate = semester.endDate?.toDate?.()?.toISOString()?.split('T')[0] || ''
        
        if (programmeType === 'regular') {
          if (semesterNumber === '1') {
            result.semester1 = { startDate, endDate }
            result.defaultSemester1Due = endDate
          } else if (semesterNumber === '2') {
            result.semester2 = { startDate, endDate }
            result.defaultSemester2Due = endDate
          }
        } else {
          if (semesterNumber === '1') {
            result.trimester1 = { startDate, endDate }
            result.defaultTrimester1Due = endDate
          } else if (semesterNumber === '2') {
            result.trimester2 = { startDate, endDate }
            result.defaultTrimester2Due = endDate
          } else if (semesterNumber === '3') {
            result.trimester3 = { startDate, endDate }
            result.defaultTrimester3Due = endDate
          }
        }
      }
    })
    
    // If we don't have enough data, fill with calculated defaults
    if (Object.keys(result).length === 0) {
      return calculateDefaultDates(academicYear)
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Error fetching academic period dates:', error)
    return calculateDefaultDates(academicYear)
  }
}

/**
 * Calculate default academic dates based on academic year
 */
function calculateDefaultDates(academicYear: string): {
  defaultSemester1Due: string
  defaultSemester2Due: string
  defaultTrimester1Due: string
  defaultTrimester2Due: string
  defaultTrimester3Due: string
} {
  // Extract year from academic year (e.g., "2024/2025" -> 2024)
  const startYear = parseInt(academicYear.split('/')[0]) || new Date().getFullYear()
  
  return {
    defaultSemester1Due: `${startYear}-12-15`, // Mid December
    defaultSemester2Due: `${startYear + 1}-05-15`, // Mid May
    defaultTrimester1Due: `${startYear}-12-15`, // Mid December
    defaultTrimester2Due: `${startYear + 1}-03-15`, // Mid March
    defaultTrimester3Due: `${startYear + 1}-06-15`, // Mid June
  }
}

/**
 * Get semester-specific fees for a student based on current academic period
 */
export async function getCurrentSemesterFees(
  studentId: string,
  programmeType: 'regular' | 'weekend',
  level: number
): Promise<{
  currentSemesterFees: number
  paidAmount: number
  balance: number
  semesterName: string
  semesterNumber: string
  dueDate: string
  isCurrentPeriod: boolean
  status: string
} | null> {
  try {
    const academicPeriod = await getCurrentAcademicPeriod()
    if (!academicPeriod) {
      return null
    }
    
    // Get the appropriate semester based on programme type
    const targetSemester = programmeType === 'regular' 
      ? academicPeriod.regularSemester 
      : academicPeriod.weekendSemester
    
    if (!targetSemester) {
      console.warn(`⚠️ No active ${programmeType} semester found`)
      return null
    }
    
    // Import fee calculator
    const { calculateStudentFees } = await import('./fee-calculator')
    const feeCalculation = await calculateStudentFees(studentId, programmeType, level, academicPeriod.academicYear)
    
    // Find the installment for current semester/trimester
    const currentPeriodKey = programmeType === 'regular' 
      ? `semester${targetSemester.number}`
      : `trimester${targetSemester.number}`
    
    const currentInstallment = feeCalculation.installments.find(
      installment => installment.period === currentPeriodKey
    )
    
    if (!currentInstallment) {
      console.warn(`⚠️ No installment found for ${currentPeriodKey}`)
      return null
    }
    
    // Get student payments to calculate what's been paid for this semester
    const { getStudentPayments } = await import('./firebase')
    const studentPayments = await getStudentPayments(studentId)
    
    // Calculate paid amount for this specific semester
    let paidAmount = 0
    studentPayments.forEach(payment => {
      if (payment.status === 'verified' || payment.status === 'approved') {
        // Check if payment applies to current semester
        if (payment.paymentPeriod === currentPeriodKey) {
          paidAmount += payment.amount
        } else if (payment.paymentFor?.includes(currentPeriodKey)) {
          // Fallback check using paymentFor array
          paidAmount += payment.amount
        }
      }
    })
    
    const balance = Math.max(0, currentInstallment.amount - paidAmount)
    const status = balance <= 0 ? 'Paid' : 
                   new Date() > new Date(currentInstallment.dueDate) ? 'Overdue' : 'Not Paid'
    
    console.log(`💰 Current ${programmeType} ${targetSemester.name} fees:`, {
      amount: currentInstallment.amount,
      paid: paidAmount,
      balance: balance,
      status: status,
      dueDate: currentInstallment.dueDate
    })
    
    return {
      currentSemesterFees: currentInstallment.amount,
      paidAmount: paidAmount,
      balance: balance,
      semesterName: targetSemester.name,
      semesterNumber: targetSemester.number,
      dueDate: currentInstallment.dueDate,
      isCurrentPeriod: targetSemester.status === 'active',
      status: status
    }
    
  } catch (error) {
    console.error('❌ Error calculating current semester fees:', error)
    return null
  }
}

/**
 * Check if fees should be displayed automatically based on academic calendar
 */
export async function shouldDisplayCurrentFees(programmeType: 'regular' | 'weekend'): Promise<boolean> {
  try {
    const academicPeriod = await getCurrentAcademicPeriod()
    if (!academicPeriod) return false
    
    const targetSemester = programmeType === 'regular' 
      ? academicPeriod.regularSemester 
      : academicPeriod.weekendSemester
    
    // Display fees if there's an active semester for this programme type
    return targetSemester?.status === 'active'
    
  } catch (error) {
    console.error('❌ Error checking fee display status:', error)
    return false
  }
}
