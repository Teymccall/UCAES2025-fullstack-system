import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const db = getDb()
    let q = db.collection('scholarships')
    if (status) q = q.where('status', '==', status)
    const snap = await q.orderBy('createdAt', 'desc').get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Scholarships GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load scholarships' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, name, type, amount, year, status = 'applied', createdBy = 'system' } = body || {}
    if (!studentId || !name || typeof amount !== 'number') return NextResponse.json({ success: false, error: 'studentId, name, amount required' }, { status: 400 })
    const db = getDb()
    const ref = await db.collection('scholarships').add({
      studentId,
      name,
      type: type || 'scholarship',
      amount,
      year: year || new Date().getFullYear().toString(),
      status,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    console.error('Scholarships POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create scholarship' }, { status: 500 })
  }
}


