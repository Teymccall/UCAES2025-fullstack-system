import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from './firebase'

// Local fallback of official 2025/2026 structure to avoid cross-app imports
const FALLBACK_OFFICIAL_2025_2026: any = {
  REGULAR: {
    '100': { total: 6950, firstPayment: 3475, secondPayment: 3475 },
    '200': { total: 6100, firstPayment: 3050, secondPayment: 3050 },
    '300': { total: 6400, firstPayment: 3200, secondPayment: 3200 },
    '400': { total: 6100, firstPayment: 3050, secondPayment: 3050 },
  },
  WEEKEND: {
    '100': { total: 8250, firstPayment: 3300, secondPayment: 2475, thirdPayment: 2475 },
    '200': { total: 7400, firstPayment: 2960, secondPayment: 2220, thirdPayment: 2220 },
    '300': { total: 7700, firstPayment: 3080, secondPayment: 2310, thirdPayment: 2310 },
    '400': { total: 7400, firstPayment: 2960, secondPayment: 2220, thirdPayment: 2220 },
  },
}

export interface StudentFeeCalculation {
  studentId: string
  programmeType: 'regular' | 'weekend'
  level: number
  academicYear: string
  totalAnnualFee: number
  paymentStructure: 'semester' | 'trimester'
  installments: FeeInstallment[]
  additionalServices: AdditionalService[]
  totalWithServices: number
  scholarshipReduction?: number // NEW: Total amount reduced by scholarships
  appliedScholarships?: any[]   // NEW: List of applied scholarships
  feeSource?: string           // NEW: Source of fee data (finance_officer, system_database, hardcoded_fallback)
  sourceDetails?: {            // NEW: Details about fee source
    source: string
    createdBy?: string
    sourceId?: string
  }
}

export interface FeeInstallment {
  period: string // semester1, semester2, trimester1, etc.
  name: string
  amount: number
  percentage: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
}

export interface AdditionalService {
  id: string
  name: string
  amount: number
  type: 'Mandatory' | 'Optional' | 'Service'
  category: string
  description: string
  isApplicable: boolean
  isRequired: boolean
}

/**
 * Calculate comprehensive fee structure for a student
 */
export async function calculateStudentFees(
  studentId: string,
  programmeType: 'regular' | 'weekend',
  level: number,
  academicYear: string = '2024-2025'
): Promise<StudentFeeCalculation> {
  try {
    // 1. PRIORITY: Check Finance Officer fee structures FIRST (NEW BUSINESS LOGIC)
    let levelData: any = null
    let feeSource = 'unknown'
    
    try {
      console.log('🏦 Checking Finance Officer fee structures first...')
      const { getFinanceOfficerFeeStructure, convertFinanceOfficerFeesToLevelData } = await import('./finance-officer-fees')
      const financeOfficerFees = await getFinanceOfficerFeeStructure(programmeType, level, academicYear)
      
      if (financeOfficerFees) {
        levelData = convertFinanceOfficerFeesToLevelData(financeOfficerFees, programmeType)
        feeSource = 'finance_officer'
        console.log(`🎯 Using Finance Officer fee structure: ${financeOfficerFees.program} ${financeOfficerFees.level}`)
        console.log(`   💰 Total: ¢${levelData.total} | Created by: ${financeOfficerFees.createdBy}`)
      }
    } catch (error) {
      console.warn('⚠️ Error checking Finance Officer fees, continuing with system defaults:', error)
    }

    // 2. FALLBACK: Get official fee structure from fee-structures collection
    if (!levelData) {
      const normalizedYear = academicYear.includes('-') ? academicYear.replace(/-/g, '/') : academicYear
      const modeLabel = programmeType === 'regular' ? 'Regular' : 'Weekend'

      let levelDoc: any | null = null
      try {
        console.log('🏫 Checking system fee-structures collection...')
        const q = query(
          collection(db, 'fee-structures'),
          where('year', '==', normalizedYear),
          where('studyMode', '==', modeLabel),
          where('level', '==', String(level)),
          limit(1)
        )
        const snap = await getDocs(q)
        if (!snap.empty) {
          levelDoc = snap.docs[0].data()
          feeSource = 'system_database'
          console.log('✅ Found system fee structure in database')
        }
      } catch (e) {
        console.warn('⚠️ Error querying fee-structures collection:', e)
      }

      if (levelDoc) {
        if (programmeType === 'regular') {
          levelData = {
            total: Number(levelDoc.total ?? (Number(levelDoc.firstPayment||0) + Number(levelDoc.secondPayment||0))),
            semester1: { amount: Number(levelDoc.firstPayment), percentage: 50 },
            semester2: { amount: Number(levelDoc.secondPayment), percentage: 50 },
            source: feeSource
          }
        } else {
          levelData = {
            total: Number(levelDoc.total ?? (Number(levelDoc.firstPayment||0) + Number(levelDoc.secondPayment||0) + Number(levelDoc.thirdPayment||0))),
            trimester1: { amount: Number(levelDoc.firstPayment), percentage: 40 },
            trimester2: { amount: Number(levelDoc.secondPayment), percentage: 30 },
            trimester3: { amount: Number(levelDoc.thirdPayment||0), percentage: 30 },
            source: feeSource
          }
        }
      }
    }

    // 3. FINAL FALLBACK: Use hardcoded constants only if no other source available
    if (!levelData) {
      console.log('📋 Using hardcoded fallback fee constants...')
      const modeKey = programmeType === 'regular' ? 'REGULAR' : 'WEEKEND'
      const fallback = FALLBACK_OFFICIAL_2025_2026[modeKey]?.[String(level)]
      if (!fallback) throw new Error(`Fee data not found for ${programmeType} Level ${level}`)
      
      feeSource = 'hardcoded_fallback'
      if (programmeType === 'regular') {
        levelData = {
          total: fallback.total,
          semester1: { amount: fallback.firstPayment, percentage: 50 },
          semester2: { amount: fallback.secondPayment, percentage: 50 },
          source: feeSource
        }
      } else {
        levelData = {
          total: fallback.total,
          trimester1: { amount: fallback.firstPayment, percentage: 40 },
          trimester2: { amount: fallback.secondPayment, percentage: 30 },
          trimester3: { amount: fallback.thirdPayment, percentage: 30 },
          source: feeSource
        }
      }
    }

    console.log(`🎯 Fee calculation using: ${feeSource} | Total: ¢${levelData.total}`)
    
    // 2. Get academic calendar and real dates from Academic Affairs
    const { getAcademicPeriodDates } = await import('./academic-period-service')
    const realDates = await getAcademicPeriodDates(academicYear, programmeType)
    
    // Convert academic year format for Firebase (replace / with -)
    const calendarDocId = academicYear.replace(/\//g, '-')
    let calendar = null
    try {
      const calendarDoc = await getDoc(doc(db, 'academic-calendar', calendarDocId))
      calendar = calendarDoc.exists() ? calendarDoc.data() : null
      if (!calendar) {
        console.warn(`⚠️ No academic calendar found for ${calendarDocId}, using Academic Affairs dates`)
      }
    } catch (calendarError) {
      console.warn('⚠️ Error fetching academic calendar, using Academic Affairs dates:', calendarError)
    }
    
    // 3. Create installments based on programme type
    const installments: FeeInstallment[] = []
    
    if (programmeType === 'regular') {
      // 2 Semesters
      installments.push({
        period: 'semester1',
        name: 'First Semester',
        amount: levelData.semester1.amount,
        percentage: levelData.semester1.percentage,
        dueDate: calendar?.regular?.semester1?.dueDate || realDates?.semester1?.endDate || realDates?.defaultSemester1Due || '2024-12-15',
        status: 'pending'
      })
      installments.push({
        period: 'semester2', 
        name: 'Second Semester',
        amount: levelData.semester2.amount,
        percentage: levelData.semester2.percentage,
        dueDate: calendar?.regular?.semester2?.dueDate || realDates?.semester2?.endDate || realDates?.defaultSemester2Due || '2025-05-15',
        status: 'pending'
      })
    } else {
      // 3 Trimesters
      installments.push({
        period: 'trimester1',
        name: 'First Trimester',
        amount: levelData.trimester1.amount,
        percentage: levelData.trimester1.percentage,
        dueDate: calendar?.weekend?.trimester1?.dueDate || realDates?.trimester1?.endDate || realDates?.defaultTrimester1Due || '2024-12-15',
        status: 'pending'
      })
      installments.push({
        period: 'trimester2',
        name: 'Second Trimester', 
        amount: levelData.trimester2.amount,
        percentage: levelData.trimester2.percentage,
        dueDate: calendar?.weekend?.trimester2?.dueDate || realDates?.trimester2?.endDate || realDates?.defaultTrimester2Due || '2025-03-15',
        status: 'pending'
      })
      installments.push({
        period: 'trimester3',
        name: 'Third Trimester',
        amount: levelData.trimester3.amount,
        percentage: levelData.trimester3.percentage,
        dueDate: calendar?.weekend?.trimester3?.dueDate || realDates?.trimester3?.endDate || realDates?.defaultTrimester3Due || '2025-06-15',
        status: 'pending'
      })
    }
    
    // 4. Get applicable additional services
    const servicesQuery = query(
      collection(db, 'fee-services'),
      where('isActive', '==', true),
      where('academicYear', '==', academicYear)
    )
    const servicesSnapshot = await getDocs(servicesQuery)
    
    const additionalServices: AdditionalService[] = []
    
    servicesSnapshot.forEach((doc) => {
      const service = doc.data()
      
      // Check if service applies to this programme type
      const appliesToProgramme = service.applicableTo?.includes(programmeType) ?? true
      
      // Check if service applies to this level
      const appliesToLevel = !service.levels || service.levels.includes(level)
      
      const isApplicable = appliesToProgramme && appliesToLevel
      const isRequired = service.type === 'Mandatory' && isApplicable
      
      additionalServices.push({
        id: doc.id,
        name: service.name,
        amount: service.amount,
        type: service.type,
        category: service.category,
        description: service.description,
        isApplicable,
        isRequired
      })
    })
    
    // 5. Calculate totals
    const totalAnnualFee = Number(levelData.total)
    const mandatoryServices = additionalServices
      .filter(s => s.isRequired)
      .reduce((sum, s) => sum + s.amount, 0)
    let totalWithServices = totalAnnualFee + mandatoryServices
    const paymentStructure = programmeType === 'regular' ? 'semester' : 'trimester'

    // 6. Apply scholarship reductions (NEW BUSINESS LOGIC)
    let scholarshipReduction = 0
    let appliedScholarships: any[] = []
    
    try {
      console.log('🎓 Checking for student scholarships...')
      const { calculateScholarshipReduction } = await import('./scholarship-service')
      const scholarshipResult = await calculateScholarshipReduction(studentId, totalWithServices, academicYear)
      
      scholarshipReduction = scholarshipResult.totalReduction
      appliedScholarships = scholarshipResult.appliedScholarships
      
      if (scholarshipReduction > 0) {
        console.log(`🎯 Applying scholarship reduction: ¢${scholarshipReduction}`)
        totalWithServices = Math.max(0, totalWithServices - scholarshipReduction)
        
        // Apply scholarship reduction to installments proportionally
        const reductionRatio = scholarshipReduction / (totalAnnualFee + mandatoryServices)
        installments.forEach(installment => {
          const installmentReduction = Math.round(installment.amount * reductionRatio)
          installment.amount = Math.max(0, installment.amount - installmentReduction)
          console.log(`📊 Reduced ${installment.name} by ¢${installmentReduction} to ¢${installment.amount}`)
        })
      }
    } catch (error) {
      console.error('⚠️ Error applying scholarships, continuing without reduction:', error)
    }

    return {
      studentId,
      programmeType,
      level,
      academicYear,
      totalAnnualFee,
      paymentStructure,
      installments,
      additionalServices,
      totalWithServices,
      scholarshipReduction, // NEW: Include scholarship information
      appliedScholarships,  // NEW: Include applied scholarships
      feeSource,           // NEW: Include fee source (finance_officer, system_database, hardcoded_fallback)
      sourceDetails: levelData.source ? { 
        source: levelData.source, 
        createdBy: levelData.createdBy,
        sourceId: levelData.sourceId 
      } : undefined
    }
  } catch (error) {
    console.error('Error calculating student fees:', error)
    throw error
  }
}

/**
 * Get current academic period for a student
 */
export function getCurrentPeriod(
  programmeType: 'regular' | 'weekend',
  currentDate: Date = new Date()
): string {
  const month = currentDate.getMonth() + 1 // 1-12
  
  if (programmeType === 'regular') {
    if (month >= 9 || month <= 1) {
      return 'semester1'
    } else {
      return 'semester2'
    }
  } else {
    if (month >= 9 && month <= 12) {
      return 'trimester1'
    } else if (month >= 1 && month <= 4) {
      return 'trimester2'
    } else {
      return 'trimester3'
    }
  }
}

/**
 * Generate fee breakdown summary
 */
export function generateFeeBreakdown(calculation: StudentFeeCalculation): string {
  const { programmeType, level, totalAnnualFee, installments, additionalServices } = calculation
  
  const mandatoryServices = additionalServices.filter(s => s.isRequired)
  const optionalServices = additionalServices.filter(s => s.isApplicable && !s.isRequired)
  
  let breakdown = `UCAES Fee Breakdown - ${programmeType.toUpperCase()} SCHOOL\n`
  breakdown += `Level ${level} - Academic Year ${calculation.academicYear}\n\n`
  breakdown += `Base Tuition Fee: ¢${totalAnnualFee.toLocaleString()}\n\n`
  
  breakdown += `Payment Schedule:\n`
  installments.forEach((installment, index) => {
    breakdown += `${index + 1}. ${installment.name}: ¢${installment.amount.toLocaleString()} (${installment.percentage}%) - Due: ${installment.dueDate}\n`
  })
  
  if (mandatoryServices.length > 0) {
    breakdown += `\nMandatory Additional Fees:\n`
    mandatoryServices.forEach(service => {
      breakdown += `- ${service.name}: ¢${service.amount.toLocaleString()}\n`
    })
  }
  
  if (optionalServices.length > 0) {
    breakdown += `\nOptional Services Available:\n`
    optionalServices.forEach(service => {
      breakdown += `- ${service.name}: ¢${service.amount.toLocaleString()} (${service.type})\n`
    })
  }
  
  breakdown += `\nTotal Annual Fee: ¢${calculation.totalWithServices.toLocaleString()}`
  
  return breakdown
}

/**
 * Check if a payment is overdue
 */
export function isPaymentOverdue(dueDate: string, currentDate: Date = new Date()): boolean {
  const due = new Date(dueDate)
  return currentDate > due
}

/**
 * Get next payment due
 */
export function getNextPaymentDue(installments: FeeInstallment[]): FeeInstallment | null {
  const pendingPayments = installments.filter(i => i.status === 'pending')
  if (pendingPayments.length === 0) return null
  
  // Sort by due date and return the earliest
  return pendingPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
}
