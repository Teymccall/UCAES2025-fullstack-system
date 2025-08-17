import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || undefined
    const db = getDb()
    let q = db.collection('budgets')
    if (year) q = q.where('year', '==', year)
    const snap = await q.get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Budgets GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load budgets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { departmentId, year, semester, amount, currency = 'GHS', createdBy = 'system' } = body || {}
    if (!departmentId || !year || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'departmentId, year and amount are required' }, { status: 400 })
    }
    const payload = {
      departmentId,
      year: String(year),
      semester: semester || null,
      amount,
      currency,
      usedAmount: 0,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const db = getDb()
    const ref = await db.collection('budgets').add(payload)
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: ref.id, ...doc.data() } })
  } catch (error: any) {
    console.error('Budgets POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create budget' }, { status: 500 })
  }
}


