import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'
import type { FinanceDashboardSummary } from '@/lib/finance-types'

// Enhanced Finance Dashboard - Real-time integrated finance metrics
export async function GET() {
  try {
    const currency = 'GHS' as const
    const alerts: string[] = []

    // Collections (ensure we use the Firestore instance, not the getter function)
    const db = getDb()
    const txCol = db.collection('finance-transactions')
    const payrollCol = db.collection('payroll')
    const budgetsCol = db.collection('budgets')
    
    // NEW: Real integrated finance collections
    const budgetTransactionsCol = db.collection('budget-transactions')
    const scholarshipsCol = db.collection('scholarships')
    const invoicesCol = db.collection('invoices')
    const procurementCol = db.collection('procurement-requests')
    const programFeesCol = db.collection('program-fees')

    // Load all data in parallel for comprehensive dashboard
    const [
      txSnap, 
      payrollSnap, 
      budgetsSnap, 
      budgetTransactionsSnap,
      scholarshipsSnap,
      invoicesSnap,
      procurementSnap,
      programFeesSnap
    ] = await Promise.all([
      txCol.get(),
      payrollCol.where('status', '==', 'pending_approval').get(),
      budgetsCol.get(),
      budgetTransactionsCol.get(),
      scholarshipsCol.get(),
      invoicesCol.get(),
      procurementCol.get(),
      programFeesCol.get()
    ])

    let revenue = 0
    let expenses = 0
    const revenueBreakdown: Record<string, number> = {}
    const expenseBreakdown: Record<string, number> = {}

    // Process traditional finance transactions
    txSnap.forEach(doc => {
      const d: any = doc.data()
      const amount = Number(d.amount || 0)
      if (d.kind === 'revenue') {
        revenue += amount
        const key = d.type || 'other'
        revenueBreakdown[key] = (revenueBreakdown[key] || 0) + amount
      } else if (d.kind === 'expense') {
        expenses += amount
        const key = d.type || 'other'
        expenseBreakdown[key] = (expenseBreakdown[key] || 0) + amount
      }
    })

    // NEW: Process budget transactions for real expense tracking
    let budgetExpenses = 0
    let procurementExpenses = 0
    let payrollExpenses = 0
    
    budgetTransactionsSnap.forEach(doc => {
      const tx: any = doc.data()
      if (tx.type === 'expense') {
        const amount = Number(tx.amount || 0)
        budgetExpenses += amount
        
        // Categorize by source
        if (tx.category === 'Procurement') {
          procurementExpenses += amount
        } else if (tx.category === 'Payroll') {
          payrollExpenses += amount
        }
        
        // Add to expense breakdown
        const key = tx.category || 'other'
        expenseBreakdown[key] = (expenseBreakdown[key] || 0) + amount
      }
    })

    // Update total expenses with budget transactions
    expenses += budgetExpenses
    const netCashFlow = revenue - expenses

    // NEW: Calculate budget utilization and alerts
    let totalBudgetAllocated = 0
    let totalBudgetSpent = 0
    let activeBudgets = 0
    let overBudgetCount = 0

    budgetsSnap.forEach(doc => {
      const budget: any = doc.data()
      if (budget.status === 'active' || budget.status === 'exceeded') {
        activeBudgets++
        totalBudgetAllocated += Number(budget.allocatedAmount || 0)
        totalBudgetSpent += Number(budget.spentAmount || 0)
        
        if (budget.status === 'exceeded') {
          overBudgetCount++
          alerts.push(`Budget "${budget.name}" exceeded by ¢${((budget.spentAmount || 0) - (budget.allocatedAmount || 0)).toLocaleString()}`)
        } else {
          const utilization = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0
          if (utilization >= 90) {
            alerts.push(`Budget "${budget.name}" is ${Math.round(utilization)}% utilized`)
          }
        }
      }
    })

    // NEW: Scholarship and fee structure metrics
    let activeScholarships = 0
    let totalScholarshipValue = 0
    let activeFeeStructures = 0
    let pendingInvoices = 0
    let totalInvoiceValue = 0

    scholarshipsSnap.forEach(doc => {
      const scholarship: any = doc.data()
      if (scholarship.status === 'awarded') {
        activeScholarships++
        totalScholarshipValue += Number(scholarship.amount || 0)
      }
    })

    programFeesSnap.forEach(doc => {
      const feeStructure: any = doc.data()
      if (feeStructure.isActive !== false) {
        activeFeeStructures++
      }
    })

    invoicesSnap.forEach(doc => {
      const invoice: any = doc.data()
      if (invoice.status === 'pending') {
        pendingInvoices++
        totalInvoiceValue += Number(invoice.total || 0)
      }
    })

    // NEW: Procurement metrics
    let pendingProcurement = 0
    let totalProcurementValue = 0

    procurementSnap.forEach(doc => {
      const procurement: any = doc.data()
      if (procurement.status === 'pending' || procurement.status === 'approved') {
        pendingProcurement++
        totalProcurementValue += Number(procurement.totalEstimatedCost || 0)
      }
    })

    // Legacy budget alerts (keep for backward compatibility)
    const departmentSpends: Record<string, number> = {}
    txSnap.forEach(doc => {
      const d: any = doc.data()
      if (d.kind === 'expense' && d.departmentId) {
        departmentSpends[d.departmentId] = (departmentSpends[d.departmentId] || 0) + Number(d.amount || 0)
      }
    })

    budgetsSnap.forEach(doc => {
      const b: any = doc.data()
      const used = departmentSpends[b.departmentId] || 0
      if (b.amount && used > b.amount) {
        alerts.push(`Department ${b.departmentId} exceeded budget by ¢${(used - b.amount).toLocaleString()}`)
      }
    })

    const summary: FinanceDashboardSummary = {
      totals: {
        revenue,
        expenses,
        netCashFlow
      },
      revenueBreakdown,
      expenseBreakdown: {
        ...expenseBreakdown,
        'Procurement': procurementExpenses,
        'Payroll': payrollExpenses
      },
      pendingApprovals: {
        transactions: txSnap.docs.filter(d => (d.data() as any).status === 'pending_approval').length,
        payroll: payrollSnap.size
      },
      alerts,
      currency,
      // NEW: Enhanced dashboard data
      budgetSummary: {
        totalAllocated: totalBudgetAllocated,
        totalSpent: totalBudgetSpent,
        utilization: totalBudgetAllocated > 0 ? Math.round((totalBudgetSpent / totalBudgetAllocated) * 100) : 0,
        activeBudgets,
        overBudgetCount
      },
      scholarshipSummary: {
        activeScholarships,
        totalValue: totalScholarshipValue
      },
      feeStructureSummary: {
        activeFeeStructures
      },
      invoiceSummary: {
        pendingInvoices,
        totalValue: totalInvoiceValue
      },
      procurementSummary: {
        pendingRequests: pendingProcurement,
        totalValue: totalProcurementValue
      }
    }

    return NextResponse.json({ success: true, data: summary })
  } catch (error: any) {
    console.error('Enhanced Finance dashboard error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}