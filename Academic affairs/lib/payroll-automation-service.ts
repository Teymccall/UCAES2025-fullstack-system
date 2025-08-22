// Payroll Automation Service - Automated payroll calculations and processing
import { getFirestore, collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { getDb } from './firebase-admin';

export interface StaffSalaryStructure {
  id: string;
  staffId: string;
  staffName: string;
  position: string;
  department: string;
  basicSalary: number;
  allowances: {
    housing?: number;
    transport?: number;
    medical?: number;
    academic?: number;
    other?: number;
  };
  deductions: {
    tax?: number;
    pension?: number;
    insurance?: number;
    other?: number;
  };
  paymentSchedule: 'monthly' | 'bi-weekly';
  isActive: boolean;
  effectiveFrom: string;
  createdAt: string;
  createdBy: string;
}

export interface PayrollCalculation {
  staffId: string;
  staffName: string;
  position: string;
  department: string;
  payPeriod: string;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  allowancesBreakdown: Record<string, number>;
  deductionsBreakdown: Record<string, number>;
  calculatedAt: string;
}

export interface PayrollBatch {
  id: string;
  batchName: string;
  payPeriod: string;
  department?: string;
  staffCount: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  status: 'draft' | 'calculated' | 'approved' | 'processed' | 'paid';
  calculations: PayrollCalculation[];
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  processedAt?: string;
}

/**
 * Get staff salary structure
 */
export async function getStaffSalaryStructure(staffId: string): Promise<StaffSalaryStructure | null> {
  try {
    console.log('💼 Fetching salary structure for staff:', staffId);
    
    const db = getDb();
    const salaryStructuresRef = db.collection('staff-salaries');
    const q = salaryStructuresRef
      .where('staffId', '==', staffId)
      .where('isActive', '==', true)
      .orderBy('effectiveFrom', 'desc')
      .limit(1);
    
    const querySnapshot = await q.get();
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        staffId: data.staffId,
        staffName: data.staffName,
        position: data.position,
        department: data.department,
        basicSalary: data.basicSalary,
        allowances: data.allowances || {},
        deductions: data.deductions || {},
        paymentSchedule: data.paymentSchedule || 'monthly',
        isActive: data.isActive,
        effectiveFrom: data.effectiveFrom,
        createdAt: data.createdAt,
        createdBy: data.createdBy
      };
    }
    
    console.log('❌ No salary structure found for staff');
    return null;
  } catch (error) {
    console.error('❌ Error fetching staff salary structure:', error);
    return null;
  }
}

/**
 * Calculate payroll for a single staff member
 */
export async function calculateStaffPayroll(
  staffId: string,
  payPeriod: string
): Promise<PayrollCalculation | null> {
  try {
    console.log('🧮 Calculating payroll for staff:', staffId, 'period:', payPeriod);
    
    const salaryStructure = await getStaffSalaryStructure(staffId);
    if (!salaryStructure) {
      console.log('❌ No salary structure found, cannot calculate payroll');
      return null;
    }
    
    // Calculate allowances
    const allowances = salaryStructure.allowances;
    const totalAllowances = Object.values(allowances).reduce((sum, amount) => sum + (amount || 0), 0);
    
    // Calculate deductions
    const deductions = salaryStructure.deductions;
    let calculatedDeductions = { ...deductions };
    
    // Calculate tax if not specified (simple 10% tax rate)
    if (!calculatedDeductions.tax) {
      const taxableIncome = salaryStructure.basicSalary + totalAllowances;
      calculatedDeductions.tax = Math.round(taxableIncome * 0.10); // 10% tax
    }
    
    // Calculate pension if not specified (5% of basic salary)
    if (!calculatedDeductions.pension) {
      calculatedDeductions.pension = Math.round(salaryStructure.basicSalary * 0.05); // 5% pension
    }
    
    const totalDeductions = Object.values(calculatedDeductions).reduce((sum, amount) => sum + (amount || 0), 0);
    
    // Calculate gross and net salary
    const grossSalary = salaryStructure.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;
    
    const calculation: PayrollCalculation = {
      staffId,
      staffName: salaryStructure.staffName,
      position: salaryStructure.position,
      department: salaryStructure.department,
      payPeriod,
      basicSalary: salaryStructure.basicSalary,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
      allowancesBreakdown: allowances,
      deductionsBreakdown: calculatedDeductions,
      calculatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Payroll calculated: ${salaryStructure.staffName} - Net: ¢${netSalary}`);
    return calculation;
    
  } catch (error) {
    console.error('❌ Error calculating staff payroll:', error);
    return null;
  }
}

/**
 * Calculate payroll for multiple staff (batch processing)
 */
export async function calculateBatchPayroll(
  staffIds: string[],
  payPeriod: string,
  batchName: string,
  department?: string,
  createdBy: string = 'HANAMEL_Finance_Officer'
): Promise<PayrollBatch | null> {
  try {
    console.log('📊 Calculating batch payroll:', { staffCount: staffIds.length, payPeriod, department });
    
    const calculations: PayrollCalculation[] = [];
    let totalGrossSalary = 0;
    let totalNetSalary = 0;
    
    // Calculate payroll for each staff member
    for (const staffId of staffIds) {
      const calculation = await calculateStaffPayroll(staffId, payPeriod);
      if (calculation) {
        calculations.push(calculation);
        totalGrossSalary += calculation.grossSalary;
        totalNetSalary += calculation.netSalary;
      }
    }
    
    if (calculations.length === 0) {
      console.log('❌ No valid payroll calculations generated');
      return null;
    }
    
    const payrollBatch: PayrollBatch = {
      id: '', // Will be set when saved
      batchName,
      payPeriod,
      department,
      staffCount: calculations.length,
      totalGrossSalary,
      totalNetSalary,
      status: 'calculated',
      calculations,
      createdAt: new Date().toISOString(),
      createdBy
    };
    
    console.log(`✅ Batch payroll calculated: ${calculations.length} staff, Total: ¢${totalNetSalary}`);
    return payrollBatch;
    
  } catch (error) {
    console.error('❌ Error calculating batch payroll:', error);
    return null;
  }
}

/**
 * Save payroll batch to database
 */
export async function savePayrollBatch(payrollBatch: PayrollBatch): Promise<string | null> {
  try {
    console.log('💾 Saving payroll batch to database...');
    
    const db = getDb();
    
    // Save the batch
    const batchRef = await db.collection('payroll-batches').add({
      batchName: payrollBatch.batchName,
      payPeriod: payrollBatch.payPeriod,
      department: payrollBatch.department,
      staffCount: payrollBatch.staffCount,
      totalGrossSalary: payrollBatch.totalGrossSalary,
      totalNetSalary: payrollBatch.totalNetSalary,
      status: payrollBatch.status,
      createdAt: payrollBatch.createdAt,
      createdBy: payrollBatch.createdBy
    });
    
    // Save individual payroll records
    const batch = db.batch();
    
    payrollBatch.calculations.forEach((calculation) => {
      const payrollRef = db.collection('payroll').doc();
      batch.set(payrollRef, {
        batchId: batchRef.id,
        staffId: calculation.staffId,
        staffName: calculation.staffName,
        position: calculation.position,
        department: calculation.department,
        payPeriod: calculation.payPeriod,
        basicSalary: calculation.basicSalary,
        totalAllowances: calculation.totalAllowances,
        totalDeductions: calculation.totalDeductions,
        grossSalary: calculation.grossSalary,
        netSalary: calculation.netSalary,
        allowancesBreakdown: calculation.allowancesBreakdown,
        deductionsBreakdown: calculation.deductionsBreakdown,
        status: 'calculated',
        calculatedAt: calculation.calculatedAt,
        createdAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
    
    console.log(`✅ Payroll batch saved: ${batchRef.id}`);
    return batchRef.id;
    
  } catch (error) {
    console.error('❌ Error saving payroll batch:', error);
    return null;
  }
}

/**
 * Process payroll payment (integrate with budget tracking)
 */
export async function processPayrollPayment(
  batchId: string,
  approvedBy: string = 'HANAMEL_Finance_Officer'
): Promise<{ success: boolean; message: string; budgetImpact?: any }> {
  try {
    console.log('💰 Processing payroll payment for batch:', batchId);
    
    const db = getDb();
    
    // Get payroll batch
    const batchDoc = await db.collection('payroll-batches').doc(batchId).get();
    if (!batchDoc.exists) {
      return { success: false, message: 'Payroll batch not found' };
    }
    
    const batchData = batchDoc.data();
    
    if (batchData.status !== 'calculated' && batchData.status !== 'approved') {
      return { success: false, message: 'Payroll batch is not ready for processing' };
    }
    
    // Check for budget impact
    let budgetImpact = null;
    try {
      // Import budget service
      const { processBudgetExpense } = await import('../../FEES PORTAL/lib/budget-tracking-service');
      
      // Find payroll budget
      const payrollBudget = await findPayrollBudget(batchData.department);
      
      if (payrollBudget) {
        const expenseResult = await processBudgetExpense(payrollBudget.id, {
          amount: batchData.totalNetSalary,
          description: `Payroll payment: ${batchData.batchName}`,
          category: 'Payroll',
          reference: `PAYROLL-${batchId}`,
          approvedBy,
          sourceCollection: 'payroll-batches',
          sourceDocumentId: batchId
        });
        
        budgetImpact = expenseResult;
        console.log('💰 Budget impact processed:', expenseResult.message);
      }
    } catch (budgetError) {
      console.warn('⚠️ Could not process budget impact:', budgetError);
    }
    
    // Update batch status
    await db.collection('payroll-batches').doc(batchId).update({
      status: 'processed',
      approvedBy,
      processedAt: new Date().toISOString(),
      budgetImpact: budgetImpact?.success || false
    });
    
    // Update individual payroll records
    const payrollQuery = db.collection('payroll').where('batchId', '==', batchId);
    const payrollSnapshot = await payrollQuery.get();
    
    const updateBatch = db.batch();
    payrollSnapshot.docs.forEach((doc) => {
      updateBatch.update(doc.ref, {
        status: 'processed',
        processedAt: new Date().toISOString(),
        processedBy: approvedBy
      });
    });
    
    await updateBatch.commit();
    
    console.log(`✅ Payroll payment processed: ¢${batchData.totalNetSalary} for ${batchData.staffCount} staff`);
    
    return {
      success: true,
      message: `Payroll processed successfully. Total paid: ¢${batchData.totalNetSalary}`,
      budgetImpact
    };
    
  } catch (error) {
    console.error('❌ Error processing payroll payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process payroll payment'
    };
  }
}

/**
 * Find appropriate budget for payroll expenses
 */
async function findPayrollBudget(department?: string): Promise<any | null> {
  try {
    const db = getDb();
    
    // Look for payroll budget for the department
    let query = db.collection('budgets')
      .where('category', '==', 'Payroll')
      .where('status', '==', 'active')
      .orderBy('remainingAmount', 'desc')
      .limit(1);
    
    if (department) {
      query = query.where('department', '==', department);
    }
    
    const budgetSnapshot = await query.get();
    
    if (!budgetSnapshot.empty) {
      const budgetDoc = budgetSnapshot.docs[0];
      return {
        id: budgetDoc.id,
        ...budgetDoc.data()
      };
    }
    
    // Fallback to general operations budget
    const fallbackQuery = db.collection('budgets')
      .where('category', '==', 'Operations')
      .where('status', '==', 'active')
      .orderBy('remainingAmount', 'desc')
      .limit(1);
    
    const fallbackSnapshot = await fallbackQuery.get();
    
    if (!fallbackSnapshot.empty) {
      const budgetDoc = fallbackSnapshot.docs[0];
      return {
        id: budgetDoc.id,
        ...budgetDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding payroll budget:', error);
    return null;
  }
}

/**
 * Get payroll summary for Finance Officer dashboard
 */
export async function getPayrollSummary(): Promise<{
  totalMonthlyPayroll: number;
  staffCount: number;
  lastProcessedBatch?: string;
  pendingBatches: number;
  averageSalary: number;
}> {
  try {
    console.log('📊 Calculating payroll summary...');
    
    const db = getDb();
    const currentMonth = new Date().toISOString().substr(0, 7); // YYYY-MM format
    
    // Get current month's payroll
    const payrollQuery = db.collection('payroll')
      .where('payPeriod', '>=', currentMonth)
      .where('status', 'in', ['calculated', 'processed']);
    
    const payrollSnapshot = await payrollQuery.get();
    
    let totalMonthlyPayroll = 0;
    const staffCount = payrollSnapshot.size;
    
    payrollSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalMonthlyPayroll += data.netSalary || 0;
    });
    
    const averageSalary = staffCount > 0 ? Math.round(totalMonthlyPayroll / staffCount) : 0;
    
    // Get pending batches
    const batchesQuery = db.collection('payroll-batches')
      .where('status', 'in', ['calculated', 'approved']);
    
    const batchesSnapshot = await batchesQuery.get();
    const pendingBatches = batchesSnapshot.size;
    
    // Get last processed batch
    const lastBatchQuery = db.collection('payroll-batches')
      .where('status', '==', 'processed')
      .orderBy('processedAt', 'desc')
      .limit(1);
    
    const lastBatchSnapshot = await lastBatchQuery.get();
    const lastProcessedBatch = !lastBatchSnapshot.empty 
      ? lastBatchSnapshot.docs[0].data().batchName 
      : undefined;
    
    console.log(`📊 Payroll summary: ¢${totalMonthlyPayroll} total, ${staffCount} staff`);
    
    return {
      totalMonthlyPayroll,
      staffCount,
      lastProcessedBatch,
      pendingBatches,
      averageSalary
    };
    
  } catch (error) {
    console.error('❌ Error calculating payroll summary:', error);
    return {
      totalMonthlyPayroll: 0,
      staffCount: 0,
      pendingBatches: 0,
      averageSalary: 0
    };
  }
}

export default {
  getStaffSalaryStructure,
  calculateStaffPayroll,
  calculateBatchPayroll,
  savePayrollBatch,
  processPayrollPayment,
  getPayrollSummary
};



