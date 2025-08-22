// Budget Tracking Service - Automatic budget tracking with real expense deductions
import { getFirestore, collection, doc, getDocs, updateDoc, addDoc, query, where, orderBy, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

export interface Budget {
  id: string;
  name: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  academicYear: string;
  status: 'active' | 'inactive' | 'completed' | 'exceeded';
  department: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  // New fields for tracking
  transactions: BudgetTransaction[];
  lastExpenseDate?: string;
  utilizationPercentage: number;
}

export interface BudgetTransaction {
  id: string;
  budgetId: string;
  type: 'expense' | 'allocation' | 'transfer';
  amount: number;
  description: string;
  category: string;
  reference: string; // Reference to procurement, transfer, etc.
  approvedBy: string;
  processedAt: string;
  sourceCollection: 'procurement-requests' | 'internal-transfers' | 'payroll' | 'manual';
  sourceDocumentId: string;
}

/**
 * Get budget by ID with current balance calculations
 */
export async function getBudgetById(budgetId: string): Promise<Budget | null> {
  try {
    console.log('💰 Fetching budget:', budgetId);
    
    const budgetDoc = await getDocs(query(
      collection(db, 'budgets'),
      where('__name__', '==', budgetId)
    ));
    
    if (budgetDoc.empty) {
      console.log('❌ Budget not found');
      return null;
    }
    
    const budgetData = budgetDoc.docs[0].data();
    
    // Calculate real-time budget status
    const transactions = await getBudgetTransactions(budgetId);
    const spentAmount = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remainingAmount = budgetData.allocatedAmount - spentAmount;
    const utilizationPercentage = Math.round((spentAmount / budgetData.allocatedAmount) * 100);
    
    const status = spentAmount > budgetData.allocatedAmount ? 'exceeded' : 
                   utilizationPercentage >= 90 ? 'active' : 'active';
    
    return {
      id: budgetDoc.docs[0].id,
      name: budgetData.name,
      category: budgetData.category,
      allocatedAmount: budgetData.allocatedAmount,
      spentAmount,
      remainingAmount,
      academicYear: budgetData.academicYear,
      status,
      department: budgetData.department,
      createdAt: budgetData.createdAt,
      createdBy: budgetData.createdBy,
      updatedAt: budgetData.updatedAt,
      transactions,
      lastExpenseDate: transactions.length > 0 ? transactions[0].processedAt : undefined,
      utilizationPercentage
    };
  } catch (error) {
    console.error('❌ Error fetching budget:', error);
    return null;
  }
}

/**
 * Get all budget transactions for a budget
 */
export async function getBudgetTransactions(budgetId: string): Promise<BudgetTransaction[]> {
  try {
    const transactionsRef = collection(db, 'budget-transactions');
    const q = query(
      transactionsRef,
      where('budgetId', '==', budgetId),
      orderBy('processedAt', 'desc')
    );
    
    const transactionsSnapshot = await getDocs(q);
    
    const transactions: BudgetTransaction[] = [];
    transactionsSnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        budgetId: data.budgetId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        reference: data.reference,
        approvedBy: data.approvedBy,
        processedAt: data.processedAt,
        sourceCollection: data.sourceCollection,
        sourceDocumentId: data.sourceDocumentId
      });
    });
    
    return transactions;
  } catch (error) {
    console.error('❌ Error fetching budget transactions:', error);
    return [];
  }
}

/**
 * Find appropriate budget for an expense
 */
export async function findBudgetForExpense(
  department: string,
  category: string,
  amount: number
): Promise<Budget | null> {
  try {
    console.log('🔍 Finding budget for expense:', { department, category, amount });
    
    const budgetsRef = collection(db, 'budgets');
    const q = query(
      budgetsRef,
      where('department', '==', department),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('remainingAmount', 'desc')
    );
    
    const budgetsSnapshot = await getDocs(q);
    
    for (const budgetDoc of budgetsSnapshot.docs) {
      const budget = await getBudgetById(budgetDoc.id);
      if (budget && budget.remainingAmount >= amount) {
        console.log(`✅ Found suitable budget: ${budget.name} (¢${budget.remainingAmount} available)`);
        return budget;
      }
    }
    
    // If no exact match, try broader category search
    const broadQuery = query(
      budgetsRef,
      where('department', '==', department),
      where('status', '==', 'active'),
      orderBy('remainingAmount', 'desc')
    );
    
    const broadSnapshot = await getDocs(broadQuery);
    
    for (const budgetDoc of broadSnapshot.docs) {
      const budget = await getBudgetById(budgetDoc.id);
      if (budget && budget.remainingAmount >= amount) {
        console.log(`✅ Found fallback budget: ${budget.name} (¢${budget.remainingAmount} available)`);
        return budget;
      }
    }
    
    console.log('❌ No suitable budget found for expense');
    return null;
  } catch (error) {
    console.error('❌ Error finding budget for expense:', error);
    return null;
  }
}

/**
 * Record expense against budget (AUTOMATIC DEDUCTION)
 */
export async function recordBudgetExpense(
  budgetId: string,
  expense: {
    amount: number;
    description: string;
    category: string;
    reference: string;
    approvedBy: string;
    sourceCollection: 'procurement-requests' | 'internal-transfers' | 'payroll' | 'manual';
    sourceDocumentId: string;
  }
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    console.log('💸 Recording budget expense:', { budgetId, amount: expense.amount });
    
    return await runTransaction(db, async (transaction) => {
      // Get current budget
      const budget = await getBudgetById(budgetId);
      if (!budget) {
        throw new Error('Budget not found');
      }
      
      // Check if expense exceeds remaining budget
      if (expense.amount > budget.remainingAmount) {
        console.warn(`⚠️ Expense (¢${expense.amount}) exceeds remaining budget (¢${budget.remainingAmount})`);
        // Allow but mark as over-budget
      }
      
      // Create budget transaction record
      const budgetTransaction: Omit<BudgetTransaction, 'id'> = {
        budgetId,
        type: 'expense',
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        reference: expense.reference,
        approvedBy: expense.approvedBy,
        processedAt: new Date().toISOString(),
        sourceCollection: expense.sourceCollection,
        sourceDocumentId: expense.sourceDocumentId
      };
      
      // Add transaction record
      const transactionRef = doc(collection(db, 'budget-transactions'));
      transaction.set(transactionRef, budgetTransaction);
      
      // Update budget balance
      const newSpentAmount = budget.spentAmount + expense.amount;
      const newRemainingAmount = budget.allocatedAmount - newSpentAmount;
      const newUtilizationPercentage = Math.round((newSpentAmount / budget.allocatedAmount) * 100);
      
      const newStatus = newSpentAmount > budget.allocatedAmount ? 'exceeded' :
                       newUtilizationPercentage >= 90 ? 'active' : 'active';
      
      const budgetRef = doc(db, 'budgets', budgetId);
      transaction.update(budgetRef, {
        spentAmount: newSpentAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
        lastExpenseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Budget expense recorded: ¢${expense.amount}`);
      console.log(`📊 New balance: ¢${newRemainingAmount} remaining (${newUtilizationPercentage}% used)`);
      
      return {
        success: true,
        message: `Expense recorded successfully. New balance: ¢${newRemainingAmount}`,
        newBalance: newRemainingAmount
      };
    });
  } catch (error) {
    console.error('❌ Error recording budget expense:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to record expense'
    };
  }
}

/**
 * Process procurement request against budget
 */
export async function processProcurementBudgetImpact(
  procurementId: string,
  procurementData: {
    department: string;
    totalEstimatedCost: number;
    items: Array<{ description: string; quantity: number; estimatedCost: number }>;
    requestedBy: string;
    status: string;
  }
): Promise<{ success: boolean; message: string; budgetId?: string }> {
  try {
    console.log('📦 Processing procurement budget impact:', procurementId);
    
    if (procurementData.status !== 'approved') {
      console.log('ℹ️ Procurement not approved, skipping budget impact');
      return { success: true, message: 'Procurement not approved, no budget impact' };
    }
    
    // Find appropriate budget
    const budget = await findBudgetForExpense(
      procurementData.department,
      'Operations', // Default category for procurement
      procurementData.totalEstimatedCost
    );
    
    if (!budget) {
      return {
        success: false,
        message: `No suitable budget found for procurement of ¢${procurementData.totalEstimatedCost}`
      };
    }
    
    // Record expense
    const expenseResult = await recordBudgetExpense(budget.id, {
      amount: procurementData.totalEstimatedCost,
      description: `Procurement: ${procurementData.items[0]?.description} ${procurementData.items.length > 1 ? `+ ${procurementData.items.length - 1} more items` : ''}`,
      category: 'Procurement',
      reference: `PR-${procurementId}`,
      approvedBy: procurementData.requestedBy,
      sourceCollection: 'procurement-requests',
      sourceDocumentId: procurementId
    });
    
    return {
      success: expenseResult.success,
      message: expenseResult.message,
      budgetId: budget.id
    };
  } catch (error) {
    console.error('❌ Error processing procurement budget impact:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process procurement budget impact'
    };
  }
}

/**
 * Process internal transfer budget impact
 */
export async function processTransferBudgetImpact(
  transferId: string,
  transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    purpose: string;
    authorizedBy: string;
    status: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔄 Processing transfer budget impact:', transferId);
    
    if (transferData.status !== 'approved') {
      console.log('ℹ️ Transfer not approved, skipping budget impact');
      return { success: true, message: 'Transfer not approved, no budget impact' };
    }
    
    // For internal transfers, we deduct from source budget and potentially add to destination
    // Find source budget
    const sourceBudget = await findBudgetForExpense(
      'Academic Affairs', // Default department
      'Internal Transfers',
      transferData.amount
    );
    
    if (sourceBudget) {
      const expenseResult = await recordBudgetExpense(sourceBudget.id, {
        amount: transferData.amount,
        description: `Internal Transfer: ${transferData.purpose}`,
        category: 'Internal Transfer',
        reference: `TRF-${transferId}`,
        approvedBy: transferData.authorizedBy,
        sourceCollection: 'internal-transfers',
        sourceDocumentId: transferId
      });
      
      return expenseResult;
    }
    
    return {
      success: true,
      message: 'No budget impact required for this transfer'
    };
  } catch (error) {
    console.error('❌ Error processing transfer budget impact:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process transfer budget impact'
    };
  }
}

/**
 * Get budget utilization summary for dashboard
 */
export async function getBudgetUtilizationSummary(): Promise<{
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overBudgetCount: number;
  activeBudgets: number;
  utilizationPercentage: number;
}> {
  try {
    console.log('📊 Calculating budget utilization summary...');
    
    const budgetsRef = collection(db, 'budgets');
    const q = query(budgetsRef, where('status', 'in', ['active', 'exceeded']));
    const budgetsSnapshot = await getDocs(q);
    
    let totalAllocated = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    const activeBudgets = budgetsSnapshot.size;
    
    for (const budgetDoc of budgetsSnapshot.docs) {
      const budget = await getBudgetById(budgetDoc.id);
      if (budget) {
        totalAllocated += budget.allocatedAmount;
        totalSpent += budget.spentAmount;
        if (budget.status === 'exceeded') {
          overBudgetCount++;
        }
      }
    }
    
    const totalRemaining = totalAllocated - totalSpent;
    const utilizationPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    
    console.log(`📊 Budget Summary: ${utilizationPercentage}% utilized (¢${totalSpent}/¢${totalAllocated})`);
    
    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      overBudgetCount,
      activeBudgets,
      utilizationPercentage
    };
  } catch (error) {
    console.error('❌ Error calculating budget utilization:', error);
    return {
      totalAllocated: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overBudgetCount: 0,
      activeBudgets: 0,
      utilizationPercentage: 0
    };
  }
}

export default {
  getBudgetById,
  getBudgetTransactions,
  findBudgetForExpense,
  recordBudgetExpense,
  processProcurementBudgetImpact,
  processTransferBudgetImpact,
  getBudgetUtilizationSummary
};



