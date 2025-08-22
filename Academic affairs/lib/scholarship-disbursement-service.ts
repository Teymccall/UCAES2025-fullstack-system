/**
 * Scholarship Disbursement Service
 * 
 * Handles semester-based scholarship disbursements and academic year progressions.
 * This service ensures that scholarships are properly distributed across semesters
 * and handles renewals when students progress to new academic years.
 */

import { getDb } from './firebase-admin'

export interface ScholarshipDisbursement {
  id: string
  scholarshipId: string
  studentId: string
  academicYear: string
  semester: string
  amount: number
  plannedDate: string
  disbursedDate?: string
  status: 'pending' | 'disbursed' | 'failed' | 'cancelled'
  feeReduction: number // Amount applied to student fees
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ScholarshipSchedule {
  scholarshipId: string
  totalAmount: number
  disbursementPlan: 'semester' | 'annual' | 'custom'
  disbursements: ScholarshipDisbursement[]
  renewalCriteria?: {
    minimumGPA?: number
    academicStanding?: 'Good' | 'Excellent'
    maxDuration?: number // in years
  }
}

export class ScholarshipDisbursementService {
  private db = getDb()

  /**
   * Create disbursement schedule when scholarship is awarded
   */
  async createDisbursementSchedule(
    scholarshipId: string,
    studentId: string,
    totalAmount: number,
    academicYear: string,
    semester: string,
    disbursementPlan: 'semester' | 'annual' | 'custom' = 'semester',
    customSchedule?: { semester: string, percentage: number }[]
  ): Promise<ScholarshipSchedule> {
    
    const disbursements: ScholarshipDisbursement[] = []
    const currentDate = new Date()

    if (disbursementPlan === 'semester') {
      // Split amount across semesters in the academic year
      const semesterAmount = totalAmount / 2 // Assuming 2 semesters per year
      
      // First semester (current)
      if (semester === 'First Semester' || semester === 'First Trimester') {
        disbursements.push({
          id: `${scholarshipId}_${academicYear}_1`,
          scholarshipId,
          studentId,
          academicYear,
          semester: 'First Semester',
          amount: semesterAmount,
          plannedDate: currentDate.toISOString(),
          status: 'pending',
          feeReduction: semesterAmount,
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString()
        })

        // Second semester
        const secondSemesterDate = new Date(currentDate)
        secondSemesterDate.setMonth(currentDate.getMonth() + 6) // 6 months later
        
        disbursements.push({
          id: `${scholarshipId}_${academicYear}_2`,
          scholarshipId,
          studentId,
          academicYear,
          semester: 'Second Semester',
          amount: semesterAmount,
          plannedDate: secondSemesterDate.toISOString(),
          status: 'pending',
          feeReduction: semesterAmount,
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString()
        })
      } else {
        // Started in second semester, only one disbursement for this year
        disbursements.push({
          id: `${scholarshipId}_${academicYear}_2`,
          scholarshipId,
          studentId,
          academicYear,
          semester: 'Second Semester',
          amount: totalAmount,
          plannedDate: currentDate.toISOString(),
          status: 'pending',
          feeReduction: totalAmount,
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString()
        })
      }
    } else if (disbursementPlan === 'annual') {
      // Single disbursement for the entire year
      disbursements.push({
        id: `${scholarshipId}_${academicYear}_annual`,
        scholarshipId,
        studentId,
        academicYear,
        semester,
        amount: totalAmount,
        plannedDate: currentDate.toISOString(),
        status: 'pending',
        feeReduction: totalAmount,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
      })
    }

    // Save disbursements to Firebase
    for (const disbursement of disbursements) {
      await this.db.collection('scholarship-disbursements').doc(disbursement.id).set(disbursement)
    }

    const schedule: ScholarshipSchedule = {
      scholarshipId,
      totalAmount,
      disbursementPlan,
      disbursements
    }

    // Save schedule
    await this.db.collection('scholarship-schedules').doc(scholarshipId).set(schedule)

    return schedule
  }

  /**
   * Process a single disbursement by ID
   */
  async processSingleDisbursement(disbursementId: string): Promise<void> {
    const disbursementRef = this.db.collection('scholarship-disbursements').doc(disbursementId)
    const disbursementDoc = await disbursementRef.get()

    if (!disbursementDoc.exists) {
      throw new Error('Disbursement not found')
    }

    const disbursement = disbursementDoc.data() as ScholarshipDisbursement

    if (disbursement.status !== 'pending') {
      throw new Error(`Cannot process disbursement with status: ${disbursement.status}`)
    }

    try {
      // Apply fee reduction to student account
      await this.applyFeeReduction(
        disbursement.studentId, 
        disbursement.amount, 
        disbursement.academicYear, 
        disbursement.semester
      )
      
      // Mark as disbursed
      await disbursementRef.update({
        status: 'disbursed',
        disbursedDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      console.log(`✅ Disbursed scholarship: ${disbursement.id} - ¢${disbursement.amount} to ${disbursement.studentId}`)
      
    } catch (error) {
      console.error(`❌ Failed to disburse scholarship: ${disbursement.id}`, error)
      
      // Mark as failed
      await disbursementRef.update({
        status: 'failed',
        notes: `Disbursement failed: ${error}`,
        updatedAt: new Date().toISOString()
      })

      throw error
    }
  }

  /**
   * Process pending disbursements for current academic period
   */
  async processPendingDisbursements(academicYear: string, semester: string): Promise<void> {
    const pendingQuery = this.db.collection('scholarship-disbursements')
      .where('status', '==', 'pending')
      .where('academicYear', '==', academicYear)
      .where('semester', '==', semester)

    const pendingSnapshot = await pendingQuery.get()

    for (const doc of pendingSnapshot.docs) {
      const disbursement = doc.data() as ScholarshipDisbursement
      
      try {
        // Apply fee reduction to student account
        await this.applyFeeReduction(disbursement.studentId, disbursement.amount, academicYear, semester)
        
        // Mark as disbursed
        await doc.ref.update({
          status: 'disbursed',
          disbursedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        console.log(`✅ Disbursed scholarship: ${disbursement.id} - ¢${disbursement.amount} to ${disbursement.studentId}`)
        
      } catch (error) {
        console.error(`❌ Failed to disburse scholarship: ${disbursement.id}`, error)
        
        // Mark as failed
        await doc.ref.update({
          status: 'failed',
          notes: `Disbursement failed: ${error}`,
          updatedAt: new Date().toISOString()
        })
      }
    }
  }

  /**
   * Apply fee reduction to student's account
   */
  private async applyFeeReduction(studentId: string, amount: number, academicYear: string, semester: string): Promise<void> {
    // Create a fee credit entry
    const feeCredit = {
      studentId,
      type: 'scholarship_credit',
      amount: -amount, // Negative amount reduces fees
      academicYear,
      semester,
      description: `Scholarship disbursement - ¢${amount.toLocaleString()}`,
      appliedDate: new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    }

    await this.db.collection('fee-adjustments').add(feeCredit)

    // Also update student's fee calculation
    const studentFeesRef = this.db.collection('student-fees')
      .doc(`${studentId}_${academicYear.replace('/', '-')}_${semester.replace(' ', '_')}`)

    const feeDoc = await studentFeesRef.get()
    if (feeDoc.exists) {
      const currentFees = feeDoc.data()
      const newBalance = (currentFees?.outstandingBalance || 0) - amount

      await studentFeesRef.update({
        scholarshipCredits: (currentFees?.scholarshipCredits || 0) + amount,
        outstandingBalance: Math.max(0, newBalance),
        updatedAt: new Date().toISOString()
      })
    }
  }

  /**
   * Handle academic year progression for renewable scholarships
   */
  async handleAcademicYearProgression(currentYear: string, newYear: string): Promise<void> {
    console.log(`🎓 Processing academic year progression: ${currentYear} → ${newYear}`)

    // Get all renewable scholarships from the current year
    const renewableQuery = this.db.collection('scholarships')
      .where('renewable', '==', true)
      .where('academicYear', '==', currentYear)
      .where('status', '==', 'disbursed')

    const renewableSnapshot = await renewableQuery.get()

    for (const doc of renewableSnapshot.docs) {
      const scholarship = doc.data()
      
      try {
        // Check renewal criteria
        const isEligible = await this.checkRenewalEligibility(scholarship.studentId, scholarship.renewalCriteria)
        
        if (isEligible) {
          // Create new scholarship for new academic year
          const renewedScholarship = {
            ...scholarship,
            id: undefined, // Let Firestore generate new ID
            academicYear: newYear,
            semester: 'First Semester', // Reset to first semester
            status: 'awarded',
            awardDate: new Date().toISOString(),
            parentScholarshipId: doc.id, // Link to original
            renewalCount: (scholarship.renewalCount || 0) + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          const newScholarshipRef = await this.db.collection('scholarships').add(renewedScholarship)
          
          // Create new disbursement schedule
          await this.createDisbursementSchedule(
            newScholarshipRef.id,
            scholarship.studentId,
            scholarship.amount,
            newYear,
            'First Semester',
            'semester'
          )

          console.log(`✅ Renewed scholarship for ${scholarship.studentId}: ${newScholarshipRef.id}`)
          
        } else {
          console.log(`❌ Scholarship renewal denied for ${scholarship.studentId} - eligibility criteria not met`)
        }
        
      } catch (error) {
        console.error(`❌ Error processing renewal for ${scholarship.studentId}:`, error)
      }
    }
  }

  /**
   * Check if student meets renewal criteria
   */
  private async checkRenewalEligibility(studentId: string, criteria?: any): Promise<boolean> {
    if (!criteria) return true // No specific criteria, auto-renew

    try {
      // Get student's current academic performance
      const studentQuery = this.db.collection('students').where('studentId', '==', studentId)
      const studentSnapshot = await studentQuery.get()
      
      if (studentSnapshot.empty) return false

      const studentData = studentSnapshot.docs[0].data()
      const currentGPA = parseFloat(studentData.gpa || studentData.cgpa || '0')

      // Check GPA requirement
      if (criteria.minimumGPA && currentGPA < criteria.minimumGPA) {
        return false
      }

      // Check academic standing
      if (criteria.academicStanding) {
        const standing = this.determineAcademicStanding(currentGPA)
        if (standing !== criteria.academicStanding && criteria.academicStanding === 'Excellent') {
          return false
        }
      }

      return true
      
    } catch (error) {
      console.error('Error checking renewal eligibility:', error)
      return false
    }
  }

  private determineAcademicStanding(gpa: number): 'Good' | 'Probation' | 'Excellent' {
    if (gpa >= 3.5) return 'Excellent'
    if (gpa >= 2.0) return 'Good'
    return 'Probation'
  }

  /**
   * Get disbursement summary for a student
   */
  async getStudentDisbursementSummary(studentId: string): Promise<{
    totalAwarded: number
    totalDisbursed: number
    pendingDisbursements: ScholarshipDisbursement[]
    completedDisbursements: ScholarshipDisbursement[]
  }> {
    const disbursementsQuery = this.db.collection('scholarship-disbursements')
      .where('studentId', '==', studentId)

    const disbursementsSnapshot = await disbursementsQuery.get()
    const disbursements = disbursementsSnapshot.docs.map(doc => doc.data() as ScholarshipDisbursement)

    const totalAwarded = disbursements.reduce((sum, d) => sum + d.amount, 0)
    const totalDisbursed = disbursements.filter(d => d.status === 'disbursed').reduce((sum, d) => sum + d.amount, 0)
    const pendingDisbursements = disbursements.filter(d => d.status === 'pending')
    const completedDisbursements = disbursements.filter(d => d.status === 'disbursed')

    return {
      totalAwarded,
      totalDisbursed,
      pendingDisbursements,
      completedDisbursements
    }
  }
}

// Export singleton instance
export const scholarshipDisbursementService = new ScholarshipDisbursementService()
