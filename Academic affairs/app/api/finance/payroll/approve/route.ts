import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids = [], approver = 'system' } = body || {}
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'ids[] required' }, { status: 400 })
    }
    const db = getDb()
    const batch = db.batch()
    const col = db.collection('payroll')
    ids.forEach((id: string) => {
      const ref = col.doc(id)
      batch.update(ref, { status: 'approved', approvedBy: approver, updatedAt: new Date().toISOString() })
    })
    await batch.commit()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Payroll approve error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to approve payroll' }, { status: 500 })
  }
}


