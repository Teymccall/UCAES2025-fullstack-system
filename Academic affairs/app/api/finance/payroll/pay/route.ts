import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids = [], payer = 'system' } = body || {}
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids[] required' }, { status: 400 })
    }
    const db = getDb()
    const batch = db.batch()
    const col = db.collection('payroll')
    const txCol = db.collection('finance-transactions')

    const now = new Date().toISOString()
    for (const id of ids) {
      const ref = col.doc(id)
      const doc = await ref.get()
      if (!doc.exists) continue
      const d: any = doc.data()
      if (d.status !== 'approved') continue
      batch.update(ref, { status: 'paid', paidBy: payer, paidAt: now, updatedAt: now })
      const txRef = txCol.doc()
      batch.set(txRef, {
        kind: 'expense',
        type: 'salary',
        amount: Number(d.netPay || 0),
        currency: d.currency || 'GHS',
        date: now,
        reference: `PAYROLL-${id}`,
        description: `Salary for ${d.staffName} (${d.month})`,
        createdBy: payer,
        createdAt: now,
        status: 'posted'
      })
    }
    await batch.commit()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Payroll pay error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to mark paid' }, { status: 500 })
  }
}


