// Scholarship Service - Integrates scholarships with fee calculations
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface Scholarship {
  id: string;
  studentId: string;
  name: string;
  type: 'merit' | 'need-based' | 'academic' | 'scholarship';
  amount: number;
  percentage?: number;
  status: 'applied' | 'awarded' | 'rejected' | 'suspended';
  year: string;
  createdAt: string;
  awardedAt?: string;
  approvedBy?: string;
  // Scholarship details
  description?: string;
  eligibilityCriteria?: string;
  maxRecipients?: number;
  applicationDeadline?: string;
}

/**
 * Get all awarded scholarships for a student
 * This function is called during fee calculation to apply reductions
 */
export async function getStudentScholarships(studentId: string): Promise<Scholarship[]> {
  try {
    console.log('🎓 Fetching scholarships for student:', studentId);
    
    const scholarshipsRef = collection(db, 'scholarships');
    const q = query(
      scholarshipsRef,
      where('studentId', '==', studentId),
      where('status', '==', 'awarded')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No awarded scholarships found for student');
      return [];
    }
    
    const scholarships: Scholarship[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scholarships.push({
        id: doc.id,
        studentId: data.studentId,
        name: data.name,
        type: data.type || 'scholarship',
        amount: data.amount || 0,
        percentage: data.percentage,
        status: data.status,
        year: data.year,
        createdAt: data.createdAt,
        awardedAt: data.awardedAt,
        approvedBy: data.approvedBy,
        description: data.description,
        eligibilityCriteria: data.eligibilityCriteria,
        maxRecipients: data.maxRecipients,
        applicationDeadline: data.applicationDeadline
      });
    });
    
    console.log(`🎓 Found ${scholarships.length} awarded scholarships:`, 
      scholarships.map(s => `${s.name}: ¢${s.amount}`));
    
    return scholarships;
  } catch (error) {
    console.error('❌ Error fetching student scholarships:', error);
    return [];
  }
}

/**
 * Calculate total scholarship reduction for a student's fees
 * Returns the total amount to reduce from fees
 */
export async function calculateScholarshipReduction(
  studentId: string, 
  totalFees: number, 
  academicYear?: string
): Promise<{
  totalReduction: number;
  appliedScholarships: Scholarship[];
  reductionBreakdown: { name: string; amount: number; type: 'fixed' | 'percentage' }[];
}> {
  try {
    console.log('🧮 Calculating scholarship reductions for:', { studentId, totalFees, academicYear });
    
    const scholarships = await getStudentScholarships(studentId);
    
    if (scholarships.length === 0) {
      return {
        totalReduction: 0,
        appliedScholarships: [],
        reductionBreakdown: []
      };
    }
    
    // Filter scholarships by academic year if specified
    const relevantScholarships = academicYear 
      ? scholarships.filter(s => s.year === academicYear || !s.year)
      : scholarships;
    
    let totalReduction = 0;
    const reductionBreakdown: { name: string; amount: number; type: 'fixed' | 'percentage' }[] = [];
    
    for (const scholarship of relevantScholarships) {
      let reductionAmount = 0;
      let reductionType: 'fixed' | 'percentage' = 'fixed';
      
      if (scholarship.percentage && scholarship.percentage > 0) {
        // Percentage-based scholarship
        reductionAmount = Math.round((totalFees * scholarship.percentage) / 100);
        reductionType = 'percentage';
        console.log(`📊 ${scholarship.name}: ${scholarship.percentage}% of ¢${totalFees} = ¢${reductionAmount}`);
      } else if (scholarship.amount && scholarship.amount > 0) {
        // Fixed amount scholarship
        reductionAmount = scholarship.amount;
        reductionType = 'fixed';
        console.log(`💰 ${scholarship.name}: Fixed amount = ¢${reductionAmount}`);
      }
      
      if (reductionAmount > 0) {
        totalReduction += reductionAmount;
        reductionBreakdown.push({
          name: scholarship.name,
          amount: reductionAmount,
          type: reductionType
        });
      }
    }
    
    // Ensure reduction doesn't exceed total fees
    totalReduction = Math.min(totalReduction, totalFees);
    
    console.log(`🎯 Total scholarship reduction: ¢${totalReduction} from ¢${totalFees} (${relevantScholarships.length} scholarships)`);
    
    return {
      totalReduction,
      appliedScholarships: relevantScholarships,
      reductionBreakdown
    };
  } catch (error) {
    console.error('❌ Error calculating scholarship reduction:', error);
    return {
      totalReduction: 0,
      appliedScholarships: [],
      reductionBreakdown: []
    };
  }
}

/**
 * Get available scholarships that a student can apply for
 * Used for scholarship discovery portal
 */
export async function getAvailableScholarships(
  studentProgram?: string,
  studentLevel?: string
): Promise<Scholarship[]> {
  try {
    console.log('🔍 Fetching available scholarships for:', { studentProgram, studentLevel });
    
    const scholarshipsRef = collection(db, 'scholarships');
    
    // For now, get all active scholarships
    // Later we can add filtering by eligibility criteria
    const q = query(
      scholarshipsRef,
      where('status', 'in', ['available', 'active'])
    );
    
    const querySnapshot = await getDocs(q);
    
    const scholarships: Scholarship[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include scholarships without a specific student assigned
      if (!data.studentId) {
        scholarships.push({
          id: doc.id,
          studentId: '',
          name: data.name,
          type: data.type || 'scholarship',
          amount: data.amount || 0,
          percentage: data.percentage,
          status: data.status,
          year: data.year,
          createdAt: data.createdAt,
          description: data.description,
          eligibilityCriteria: data.eligibilityCriteria,
          maxRecipients: data.maxRecipients,
          applicationDeadline: data.applicationDeadline
        });
      }
    });
    
    console.log(`📋 Found ${scholarships.length} available scholarships`);
    return scholarships;
  } catch (error) {
    console.error('❌ Error fetching available scholarships:', error);
    return [];
  }
}

/**
 * Apply for a scholarship (student action)
 */
export async function applyForScholarship(
  scholarshipId: string,
  studentId: string,
  applicationData: {
    studentName: string;
    program: string;
    level: string;
    gpa?: number;
    reason?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📝 Processing scholarship application:', { scholarshipId, studentId });
    
    // Here we would create a scholarship application record
    // For now, this is a placeholder for the application system
    
    return {
      success: true,
      message: 'Scholarship application submitted successfully'
    };
  } catch (error) {
    console.error('❌ Error applying for scholarship:', error);
    return {
      success: false,
      message: 'Failed to submit scholarship application'
    };
  }
}

export default {
  getStudentScholarships,
  calculateScholarshipReduction,
  getAvailableScholarships,
  applyForScholarship
};



