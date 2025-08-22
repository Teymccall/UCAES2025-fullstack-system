// Service to fetch current academic year and semester from Academic Affairs Firebase
import { db, getStudentPayments } from './firebase'
import type { PaymentRecord } from './types'
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
    
    // 2. Get all semesters for this academic year to allow for flexible selection
    const semestersRef = collection(db, 'academic-semesters')
    const semestersQuery = query(
      semestersRef,
      where('academicYear', '==', activeYearDoc.id)
    )
    console.log('Querying semesters with academicYear =', activeYearDoc.id)
    const semesterSnapshot = await getDocs(semestersQuery)
    
    const result: AcademicPeriod = {
      academicYear: activeYear.year,
      academicYearId: activeYearDoc.id
    }

        const allSemesters = semesterSnapshot.docs.map(doc => ({ ...doc.data() as { name: string; number: string; status: 'active' | 'completed' | 'upcoming', programType: 'Regular' | 'Weekend' }, id: doc.id }))
    
    const findBestSemester = (programType: 'Regular' | 'Weekend') => {
        const candidates = allSemesters.filter(s => s.programType === programType)
        if (candidates.length === 0) return undefined

        let best = candidates.find(s => s.status === 'active')
        if (best) return best

        best = candidates.find(s => s.status === 'upcoming')
        if (best) return best

        // Sort by semester number ('1', '2', '3') and pick lowest for fallback
        candidates.sort((a, b) => (a.number || '9').localeCompare(b.number || '9'))
        return candidates[0]
    }

    const regularData = findBestSemester('Regular')
    if (regularData) {
        result.regularSemester = {
            id: regularData.id,
            name: regularData.name,
            number: regularData.number,
            status: regularData.status,
        }
    }

    const weekendData = findBestSemester('Weekend')
    if (weekendData) {
        result.weekendSemester = {
            id: weekendData.id,
            name: weekendData.name,
            number: weekendData.number,
            status: weekendData.status,
        }
    }

    // Set currentSemester based on active status, otherwise fallback
    if (result.regularSemester?.status === 'active') {
        result.currentSemester = { ...result.regularSemester, programType: 'Regular' }
    } else if (result.weekendSemester?.status === 'active') {
        result.currentSemester = { ...result.weekendSemester, programType: 'Weekend' }
    } else if (result.regularSemester) {
        result.currentSemester = { ...result.regularSemester, programType: 'Regular' }
    } else if (result.weekendSemester) {
        result.currentSemester = { ...result.weekendSemester, programType: 'Weekend' }
    }
    
    console.log('🎯 Academic period details (flexible search):', {
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
    
    // Even if we don't have an active academic period, we should still calculate fees
    // based on the student's programme type and level
    
    // Get the appropriate semester based on programme type if available
    const targetSemester = academicPeriod && (programmeType === 'regular' 
      ? academicPeriod.regularSemester 
      : academicPeriod.weekendSemester)
    
    if (!targetSemester && academicPeriod) {
      console.warn(`⚠️ No active ${programmeType} semester found, but will still calculate fees`)
    }
    
    // Import fee calculator
    const { calculateStudentFees } = await import('./fee-calculator')
    // Use the academic year if available, otherwise use a fallback
    const academicYear = academicPeriod?.academicYear || 'current'
    const feeCalculation = await calculateStudentFees(studentId, programmeType, level, academicYear)
    
    // Find the installment for current semester/trimester
    const currentPeriodKey = programmeType === 'regular' 
      ? `semester${targetSemester?.number || '1'}`
      : `trimester${targetSemester?.number || '1'}`
    
    let currentInstallment = feeCalculation.installments.find(
      installment => installment.period === currentPeriodKey
    )
    
    if (!currentInstallment) {
      console.warn(`⚠️ No installment found for ${currentPeriodKey}, using first installment as fallback`)
      // Use the first installment as fallback to ensure we always calculate fees
      const fallbackInstallment = feeCalculation.installments[0];
      if (!fallbackInstallment) {
        console.error('❌ No installments found at all for fee calculation');
        return null;
      }
      
      // Create a calculated installment for the current period
      const calculatedAmount = feeCalculation.totalAnnualFee / feeCalculation.installments.length;
      
      // Create a fallback installment
      const fallback = {
        period: currentPeriodKey,
        name: `Calculated ${currentPeriodKey}`,
        amount: calculatedAmount,
        percentage: 100 / feeCalculation.installments.length,
        dueDate: new Date().toISOString().split('T')[0], // Today as fallback
        status: 'pending' as 'pending' | 'paid' | 'overdue',
        description: `Calculated ${currentPeriodKey} fees`
      };
      
      // Override with fallback
      currentInstallment = fallback;
    }
    
    // Get student payments to calculate what's been paid for this semester
    const studentPayments = await getStudentPayments(studentId)
    
    // Also get wallet transactions for fee payments
    const walletTransactionsQuery = query(
      collection(db, 'wallet-transactions'),
      where('studentId', '==', studentId),
      where('type', 'in', ['fee_deduction', 'fee_payment']),
      where('status', '==', 'completed')
    );
    const walletTransactionsSnapshot = await getDocs(walletTransactionsQuery);
    
    // Calculate paid amount for this specific semester
    let paidAmount = 0
    
    // Add payments from student-payments collection
    studentPayments.forEach((payment: PaymentRecord) => {
      // Include all verified/approved/completed/success payments
            if (payment.status === 'verified') {
        // Check if payment applies to current semester
        if (payment.paymentPeriod === currentPeriodKey) {
          paidAmount += payment.amount;
        } else if (payment.paymentFor?.includes(currentPeriodKey)) {
          paidAmount += payment.amount;
        } else if (!payment.paymentPeriod && !payment.paymentFor) {
          // Default to current semester for legacy payments
          paidAmount += payment.amount;
        }
      }
    });

    // Add payments from wallet transactions
    walletTransactionsSnapshot.forEach(doc => {
      const transaction = doc.data();
      if (transaction.metadata?.paymentPeriod === currentPeriodKey) {
        paidAmount += transaction.amount / 100; // Convert from pesewas to cedis
      } else if (transaction.metadata?.paymentPeriod === undefined) {
        // Include legacy wallet transactions
        paidAmount += transaction.amount / 100;
      }
    });
    
    const balance = Math.max(0, currentInstallment.amount - paidAmount)
    const status = paidAmount >= currentInstallment.amount ? 'Paid' : 
                   new Date() > new Date(currentInstallment.dueDate) ? 'Overdue' : 'Not Paid'
    
    console.log(`💰 Current ${programmeType} ${targetSemester?.name || 'Default'} fees:`, {
      amount: currentInstallment.amount,
      paid: paidAmount,
      balance: balance,
      status: status,
      dueDate: currentInstallment.dueDate,
      academicYear: academicYear,
      studentId: studentId
    })
    
    return {
      currentSemesterFees: currentInstallment.amount,
      paidAmount: paidAmount,
      balance: balance,
      semesterName: targetSemester?.name || 'Current Semester',
      semesterNumber: targetSemester?.number || '1',
      dueDate: currentInstallment.dueDate,
      isCurrentPeriod: targetSemester?.status === 'active' || false,
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
    
    // Display fees if there's any semester found for this programme type
    return !!targetSemester
    
  } catch (error) {
    console.error('❌ Error checking fee display status:', error)
    return false
  }
}
