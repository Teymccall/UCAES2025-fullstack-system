import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const db = getDb()
    const snap = await db.collection('internal-transfers').orderBy('createdAt', 'desc').get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Transfers GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load transfers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromDepartmentId, toDepartmentId, amount, reason, requestedBy = 'system' } = body || {}
    if (!fromDepartmentId || !toDepartmentId || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'fromDepartmentId, toDepartmentId, amount required' }, { status: 400 })
    }
    const db = getDb()
    const ref = await db.collection('internal-transfers').add({
      fromDepartmentId,
      toDepartmentId,
      amount,
      reason: reason || null,
      status: 'pending',
      requestedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    console.error('Transfers POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create transfer' }, { status: 500 })
  }
}


