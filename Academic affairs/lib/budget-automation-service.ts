// Budget Automation Service - Listens for expense events and updates budgets automatically
import { getFirestore, collection, doc, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import { getDb } from './firebase-admin';

/**
 * Initialize budget automation listeners
 * This service watches for approved procurement requests and transfers,
 * then automatically deducts from appropriate budgets
 */
export function initializeBudgetAutomation() {
  console.log('🤖 Initializing budget automation service...');
  
  // Listen for approved procurement requests
  initializeProcurementBudgetListener();
  
  // Listen for approved internal transfers  
  initializeTransferBudgetListener();
  
  console.log('✅ Budget automation service initialized');
}

/**
 * Listen for procurement request approvals and automatically deduct from budgets
 */
function initializeProcurementBudgetListener() {
  try {
    const db = getDb();
    const procurementRef = db.collection('procurement-requests');
    
    // Listen for changes to procurement requests
    procurementRef
      .where('status', '==', 'approved')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const procurementData = change.doc.data();
            
            // Check if this procurement has already been processed for budget
            if (!procurementData.budgetProcessed) {
              console.log(`📦 Processing budget impact for procurement: ${change.doc.id}`);
              
              await processProcurementBudgetDeduction(change.doc.id, procurementData);
            }
          }
        });
      }, (error) => {
        console.error('❌ Error in procurement budget listener:', error);
      });
    
    console.log('👂 Procurement budget listener active');
  } catch (error) {
    console.error('❌ Error initializing procurement budget listener:', error);
  }
}

/**
 * Listen for internal transfer approvals and automatically update budgets
 */
function initializeTransferBudgetListener() {
  try {
    const db = getDb();
    const transfersRef = db.collection('internal-transfers');
    
    // Listen for changes to internal transfers
    transfersRef
      .where('status', '==', 'approved')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const transferData = change.doc.data();
            
            // Check if this transfer has already been processed for budget
            if (!transferData.budgetProcessed) {
              console.log(`🔄 Processing budget impact for transfer: ${change.doc.id}`);
              
              await processTransferBudgetDeduction(change.doc.id, transferData);
            }
          }
        });
      }, (error) => {
        console.error('❌ Error in transfer budget listener:', error);
      });
    
    console.log('👂 Transfer budget listener active');
  } catch (error) {
    console.error('❌ Error initializing transfer budget listener:', error);
  }
}

/**
 * Process procurement request budget deduction
 */
async function processProcurementBudgetDeduction(
  procurementId: string,
  procurementData: any
): Promise<void> {
  try {
    console.log(`💸 Processing budget deduction for procurement ${procurementId}...`);
    
    const db = getDb();
    
    // Find appropriate budget for this procurement
    const budget = await findBudgetForProcurement(procurementData);
    
    if (!budget) {
      console.warn(`⚠️ No suitable budget found for procurement ${procurementId}`);
      
      // Mark as processed even if no budget found to avoid reprocessing
      await db.collection('procurement-requests').doc(procurementId).update({
        budgetProcessed: true,
        budgetProcessedAt: new Date().toISOString(),
        budgetStatus: 'no_budget_found'
      });
      
      return;
    }
    
    // Calculate expense amount
    const expenseAmount = procurementData.totalEstimatedCost || 0;
    
    // Record budget transaction
    await db.collection('budget-transactions').add({
      budgetId: budget.id,
      type: 'expense',
      amount: expenseAmount,
      description: `Procurement: ${procurementData.items?.[0]?.description || 'Procurement request'}`,
      category: 'Procurement',
      reference: `PR-${procurementId}`,
      approvedBy: procurementData.requestedBy || 'System',
      processedAt: new Date().toISOString(),
      sourceCollection: 'procurement-requests',
      sourceDocumentId: procurementId
    });
    
    // Update budget balance
    const newSpentAmount = (budget.spentAmount || 0) + expenseAmount;
    const newRemainingAmount = budget.allocatedAmount - newSpentAmount;
    const utilizationPercentage = Math.round((newSpentAmount / budget.allocatedAmount) * 100);
    
    const newStatus = newSpentAmount > budget.allocatedAmount ? 'exceeded' : 'active';
    
    await db.collection('budgets').doc(budget.id).update({
      spentAmount: newSpentAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      lastExpenseDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Mark procurement as budget processed
    await db.collection('procurement-requests').doc(procurementId).update({
      budgetProcessed: true,
      budgetProcessedAt: new Date().toISOString(),
      budgetId: budget.id,
      budgetStatus: 'deducted',
      budgetAmount: expenseAmount
    });
    
    console.log(`✅ Budget deduction processed: ¢${expenseAmount} from ${budget.name}`);
    console.log(`📊 New budget balance: ¢${newRemainingAmount} (${utilizationPercentage}% used)`);
    
    // Check for budget alerts
    if (utilizationPercentage >= 90) {
      console.warn(`🚨 Budget alert: ${budget.name} is ${utilizationPercentage}% utilized`);
      await createBudgetAlert(budget.id, utilizationPercentage, 'high_utilization');
    }
    
    if (newStatus === 'exceeded') {
      console.error(`🚨 Budget exceeded: ${budget.name} is over budget by ¢${newSpentAmount - budget.allocatedAmount}`);
      await createBudgetAlert(budget.id, utilizationPercentage, 'budget_exceeded');
    }
    
  } catch (error) {
    console.error(`❌ Error processing procurement budget deduction for ${procurementId}:`, error);
    
    // Mark as failed processing to avoid infinite retries
    try {
      const db = getDb();
      await db.collection('procurement-requests').doc(procurementId).update({
        budgetProcessed: true,
        budgetProcessedAt: new Date().toISOString(),
        budgetStatus: 'processing_failed',
        budgetError: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (updateError) {
      console.error('❌ Error updating procurement with failed status:', updateError);
    }
  }
}

/**
 * Process internal transfer budget deduction
 */
async function processTransferBudgetDeduction(
  transferId: string,
  transferData: any
): Promise<void> {
  try {
    console.log(`🔄 Processing budget deduction for transfer ${transferId}...`);
    
    const db = getDb();
    const transferAmount = transferData.amount || 0;
    
    // Find source budget (assuming Academic Affairs for now)
    const budget = await findBudgetForTransfer(transferData);
    
    if (!budget) {
      console.warn(`⚠️ No suitable budget found for transfer ${transferId}`);
      
      await db.collection('internal-transfers').doc(transferId).update({
        budgetProcessed: true,
        budgetProcessedAt: new Date().toISOString(),
        budgetStatus: 'no_budget_found'
      });
      
      return;
    }
    
    // Record budget transaction
    await db.collection('budget-transactions').add({
      budgetId: budget.id,
      type: 'expense',
      amount: transferAmount,
      description: `Internal Transfer: ${transferData.purpose || 'Internal transfer'}`,
      category: 'Internal Transfer',
      reference: `TRF-${transferId}`,
      approvedBy: transferData.authorizedBy || 'System',
      processedAt: new Date().toISOString(),
      sourceCollection: 'internal-transfers',
      sourceDocumentId: transferId
    });
    
    // Update budget balance
    const newSpentAmount = (budget.spentAmount || 0) + transferAmount;
    const newRemainingAmount = budget.allocatedAmount - newSpentAmount;
    
    await db.collection('budgets').doc(budget.id).update({
      spentAmount: newSpentAmount,
      remainingAmount: newRemainingAmount,
      lastExpenseDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Mark transfer as budget processed
    await db.collection('internal-transfers').doc(transferId).update({
      budgetProcessed: true,
      budgetProcessedAt: new Date().toISOString(),
      budgetId: budget.id,
      budgetStatus: 'deducted',
      budgetAmount: transferAmount
    });
    
    console.log(`✅ Transfer budget deduction processed: ¢${transferAmount} from ${budget.name}`);
    
  } catch (error) {
    console.error(`❌ Error processing transfer budget deduction for ${transferId}:`, error);
  }
}

/**
 * Find appropriate budget for procurement
 */
async function findBudgetForProcurement(procurementData: any): Promise<any | null> {
  try {
    const db = getDb();
    const department = procurementData.department || 'Academic Affairs';
    
    // Query active budgets for the department
    const budgetsSnapshot = await db.collection('budgets')
      .where('department', '==', department)
      .where('status', '==', 'active')
      .orderBy('remainingAmount', 'desc')
      .limit(1)
      .get();
    
    if (!budgetsSnapshot.empty) {
      const budgetDoc = budgetsSnapshot.docs[0];
      return {
        id: budgetDoc.id,
        ...budgetDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding budget for procurement:', error);
    return null;
  }
}

/**
 * Find appropriate budget for transfer
 */
async function findBudgetForTransfer(transferData: any): Promise<any | null> {
  try {
    const db = getDb();
    
    // For transfers, use Academic Affairs budget as default source
    const budgetsSnapshot = await db.collection('budgets')
      .where('department', '==', 'Academic Affairs')
      .where('category', '==', 'Operations')
      .where('status', '==', 'active')
      .orderBy('remainingAmount', 'desc')
      .limit(1)
      .get();
    
    if (!budgetsSnapshot.empty) {
      const budgetDoc = budgetsSnapshot.docs[0];
      return {
        id: budgetDoc.id,
        ...budgetDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding budget for transfer:', error);
    return null;
  }
}

/**
 * Create budget alert for high utilization or exceeded budgets
 */
async function createBudgetAlert(
  budgetId: string,
  utilizationPercentage: number,
  alertType: 'high_utilization' | 'budget_exceeded'
): Promise<void> {
  try {
    const db = getDb();
    
    const alert = {
      budgetId,
      alertType,
      utilizationPercentage,
      message: alertType === 'budget_exceeded' 
        ? `Budget has been exceeded (${utilizationPercentage}% utilized)`
        : `Budget is at ${utilizationPercentage}% utilization`,
      severity: alertType === 'budget_exceeded' ? 'critical' : 'warning',
      createdAt: new Date().toISOString(),
      status: 'active',
      notified: false
    };
    
    await db.collection('budget-alerts').add(alert);
    
    console.log(`🚨 Budget alert created: ${alertType} for budget ${budgetId}`);
  } catch (error) {
    console.error('❌ Error creating budget alert:', error);
  }
}

export default {
  initializeBudgetAutomation
};



