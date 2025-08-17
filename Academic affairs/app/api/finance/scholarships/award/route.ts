import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

// Approve and award scholarship; posts a negative charge on invoice (credit) and a grant transaction
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, approver = 'system' } = body || {}
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    const db = getDb()
    const ref = db.collection('scholarships').doc(id)
    const doc = await ref.get()
    if (!doc.exists) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const data: any = doc.data()

    const batch = db.batch()
    batch.update(ref, { status: 'awarded', approvedBy: approver, updatedAt: new Date().toISOString() })

    const txRef = db.collection('finance-transactions').doc()
    batch.set(txRef, {
      kind: 'expense',
      type: 'scholarship',
      amount: data.amount,
      currency: 'GHS',
      date: new Date().toISOString(),
      description: `Scholarship award for ${data.studentId}`,
      studentId: data.studentId,
      createdBy: approver,
      createdAt: new Date().toISOString(),
      status: 'posted'
    })

    await batch.commit()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Scholarship award error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to award scholarship' }, { status: 500 })
  }
}


