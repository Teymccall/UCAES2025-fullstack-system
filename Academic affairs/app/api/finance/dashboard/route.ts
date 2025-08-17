import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'
import type { FinanceDashboardSummary } from '@/lib/finance-types'

// Aggregates finance metrics from Firestore using Admin SDK for speed
export async function GET() {
  try {
    const currency = 'GHS' as const
    const alerts: string[] = []

    // Collections (ensure we use the Firestore instance, not the getter function)
    const db = getDb()
    const txCol = db.collection('finance-transactions')
    const payrollCol = db.collection('payroll')
    const budgetsCol = db.collection('budgets')

    // Load data in parallel
    const [txSnap, payrollSnap, budgetsSnap] = await Promise.all([
      txCol.get(),
      payrollCol.where('status', '==', 'pending_approval').get(),
      budgetsCol.get()
    ])

    let revenue = 0
    let expenses = 0
    const revenueBreakdown: Record<string, number> = {}
    const expenseBreakdown: Record<string, number> = {}

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

    const netCashFlow = revenue - expenses

    // Alerts: overspending vs budgets
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
        alerts.push(`Department ${b.departmentId} exceeded budget by GHS ${(used - b.amount).toLocaleString()}`)
      }
    })

    const summary: FinanceDashboardSummary = {
      totals: {
        revenue,
        expenses,
        netCashFlow
      },
      revenueBreakdown,
      expenseBreakdown,
      pendingApprovals: {
        transactions: txSnap.docs.filter(d => (d.data() as any).status === 'pending_approval').length,
        payroll: payrollSnap.size
      },
      alerts,
      currency
    }

    return NextResponse.json({ success: true, data: summary })
  } catch (error: any) {
    console.error('Finance dashboard error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load dashboard' }, { status: 500 })
  }
}


