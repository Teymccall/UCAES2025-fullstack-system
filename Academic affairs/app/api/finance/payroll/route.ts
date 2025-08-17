import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || undefined
    const db = getDb()
    let q = db.collection('payroll')
    if (month) q = q.where('month', '==', month)
    const snap = await q.get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Payroll GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load payroll' }, { status: 500 })
  }
}

// Create or update payroll items (draft)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items = [], month, currency = 'GHS', createdBy = 'system' } = body || {}
    if (!Array.isArray(items) || !month) {
      return NextResponse.json({ success: false, error: 'month and items[] required' }, { status: 400 })
    }
    const db = getDb()
    const batch = db.batch()
    const col = db.collection('payroll')
    items.forEach((item: any) => {
      const ref = item.id ? col.doc(item.id) : col.doc()
      const base = Number(item.baseSalary || 0)
      const allowances = Number(item.allowances || 0)
      const deductions = Number(item.deductions || 0)
      const net = base + allowances - deductions
      batch.set(ref, {
        staffId: item.staffId,
        staffName: item.staffName,
        baseSalary: base,
        allowances,
        deductions,
        netPay: net,
        month,
        currency,
        status: 'pending_approval',
        createdBy,
        updatedAt: new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
      }, { merge: true })
    })
    await batch.commit()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Payroll POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to upsert payroll' }, { status: 500 })
  }
}


