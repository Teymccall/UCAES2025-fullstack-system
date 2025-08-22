// Finance Officer Fee Structure Service - Connects Finance Officer fee settings to student calculations
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface FinanceOfficerFeeStructure {
  id: string;
  program: string;
  programName: string;
  level: string;
  academicYear: string;
  fees: {
    tuition?: number;
    laboratory?: number;
    library?: number;
    sports?: number;
    examination?: number;
    registration?: number;
    facilities?: number;
    field?: number;
    teaching?: number;
    total: number;
  };
  paymentSchedule?: {
    firstInstallment: {
      amount: number;
      dueDate: string;
    };
    secondInstallment: {
      amount: number;
      dueDate: string;
    };
    thirdInstallment?: {
      amount: number;
      dueDate: string;
    };
  };
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

/**
 * Get Finance Officer created fee structure for a specific program/level/year
 * This takes PRIORITY over hardcoded fee structures
 */
export async function getFinanceOfficerFeeStructure(
  programType: 'regular' | 'weekend',
  level: number,
  academicYear?: string
): Promise<FinanceOfficerFeeStructure | null> {
  try {
    console.log('🔍 Checking Finance Officer fee structures for:', { programType, level, academicYear });
    
    // Convert program type to expected program codes
    const programCodes = programType === 'weekend' ? ['BSA-Weekend', 'BSF-Weekend', 'BESM-Weekend'] : ['BSA', 'BSF', 'BESM'];
    const levelString = `Level ${level}`;
    
    // Query Finance Officer created fee structures
    const feeStructuresRef = collection(db, 'program-fees');
    
    // Try to find exact match for academic year, level
    for (const programCode of programCodes) {
      const q = query(
        feeStructuresRef,
        where('program', '==', programCode),
        where('level', '==', levelString),
        where('academicYear', '==', academicYear),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        console.log(`✅ Found Finance Officer fee structure: ${programCode} ${levelString} for ${academicYear}`);
        console.log(`   💰 Total Fees: ¢${data.fees?.total || 'Not specified'}`);
        console.log(`   👤 Created by: ${data.createdBy}`);
        console.log(`   📅 Updated: ${data.updatedAt}`);
        
        return {
          id: doc.id,
          program: data.program,
          programName: data.programName,
          level: data.level,
          academicYear: data.academicYear,
          fees: data.fees,
          paymentSchedule: data.paymentSchedule,
          isActive: data.isActive,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          updatedAt: data.updatedAt
        };
      }
    }
    
    // If no exact academic year match, try current academic year variants
    const academicYearVariants = [
      academicYear,
      academicYear.replace('/', '-'),
      academicYear.replace('-', '/'),
      '2025/2026',
      '2025-2026'
    ];
    
    for (const yearVariant of academicYearVariants) {
      for (const programCode of programCodes) {
        const q = query(
          feeStructuresRef,
          where('program', '==', programCode),
          where('level', '==', levelString),
          where('academicYear', '==', yearVariant),
          where('isActive', '==', true),
          orderBy('updatedAt', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          
          console.log(`✅ Found Finance Officer fee structure (variant): ${programCode} ${levelString} for ${yearVariant}`);
          
          return {
            id: doc.id,
            program: data.program,
            programName: data.programName,
            level: data.level,
            academicYear: data.academicYear,
            fees: data.fees,
            paymentSchedule: data.paymentSchedule,
            isActive: data.isActive,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
            updatedAt: data.updatedAt
          };
        }
      }
    }
    
    console.log('ℹ️ No Finance Officer fee structure found, will use system defaults');
    return null;
    
  } catch (error) {
    console.error('❌ Error fetching Finance Officer fee structure:', error);
    return null;
  }
}

/**
 * Convert Finance Officer fee structure to fee calculator format
 */
export function convertFinanceOfficerFeesToLevelData(
  feeStructure: FinanceOfficerFeeStructure,
  programType: 'regular' | 'weekend'
): any {
  console.log('🔄 Converting Finance Officer fees to calculator format...');
  
  const fees = feeStructure.fees;
  const totalFees = fees.total;
  
  if (programType === 'regular') {
    // Regular students have 2 semesters
    const firstPayment = feeStructure.paymentSchedule?.firstInstallment?.amount || Math.round(totalFees / 2);
    const secondPayment = feeStructure.paymentSchedule?.secondInstallment?.amount || Math.round(totalFees / 2);
    
    const levelData = {
      total: totalFees,
      firstPayment,
      secondPayment,
      semester1: { amount: firstPayment, percentage: 50 },
      semester2: { amount: secondPayment, percentage: 50 },
      source: 'finance_officer', // Mark as Finance Officer controlled
      sourceId: feeStructure.id,
      createdBy: feeStructure.createdBy
    };
    
    console.log(`🏫 Regular program fees: Total=¢${totalFees}, Sem1=¢${firstPayment}, Sem2=¢${secondPayment}`);
    return levelData;
    
  } else {
    // Weekend students have 3 trimesters
    const firstPayment = feeStructure.paymentSchedule?.firstInstallment?.amount || Math.round(totalFees * 0.4);
    const secondPayment = feeStructure.paymentSchedule?.secondInstallment?.amount || Math.round(totalFees * 0.3);
    const thirdPayment = feeStructure.paymentSchedule?.thirdInstallment?.amount || Math.round(totalFees * 0.3);
    
    const levelData = {
      total: totalFees,
      firstPayment,
      secondPayment,
      thirdPayment,
      trimester1: { amount: firstPayment, percentage: 40 },
      trimester2: { amount: secondPayment, percentage: 30 },
      trimester3: { amount: thirdPayment, percentage: 30 },
      source: 'finance_officer',
      sourceId: feeStructure.id,
      createdBy: feeStructure.createdBy
    };
    
    console.log(`🏫 Weekend program fees: Total=¢${totalFees}, Tri1=¢${firstPayment}, Tri2=¢${secondPayment}, Tri3=¢${thirdPayment}`);
    return levelData;
  }
}

/**
 * Get all Finance Officer fee structures for reporting/management
 */
export async function getAllFinanceOfficerFeeStructures(): Promise<FinanceOfficerFeeStructure[]> {
  try {
    console.log('📋 Fetching all Finance Officer fee structures...');
    
    const feeStructuresRef = collection(db, 'program-fees');
    const q = query(
      feeStructuresRef,
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const feeStructures: FinanceOfficerFeeStructure[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      feeStructures.push({
        id: doc.id,
        program: data.program,
        programName: data.programName,
        level: data.level,
        academicYear: data.academicYear,
        fees: data.fees,
        paymentSchedule: data.paymentSchedule,
        isActive: data.isActive,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        updatedAt: data.updatedAt
      });
    });
    
    console.log(`📊 Found ${feeStructures.length} active Finance Officer fee structures`);
    return feeStructures;
    
  } catch (error) {
    console.error('❌ Error fetching all Finance Officer fee structures:', error);
    return [];
  }
}

/**
 * Check if Finance Officer has set custom fees for this program/level combination
 */
export async function hasFinanceOfficerFees(
  programType: 'regular' | 'weekend',
  level: number,
  academicYear: string = '2025/2026'
): Promise<boolean> {
  const feeStructure = await getFinanceOfficerFeeStructure(programType, level, academicYear);
  return feeStructure !== null;
}

export default {
  getFinanceOfficerFeeStructure,
  convertFinanceOfficerFeesToLevelData,
  getAllFinanceOfficerFeeStructures,
  hasFinanceOfficerFees
};

