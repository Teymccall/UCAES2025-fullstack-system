import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const db = getDb()
    const snap = await db.collection('procurements').orderBy('createdAt', 'desc').get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Procurements GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load procurements' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vendorId, description, amount, requestedBy = 'system' } = body || {}
    if (!vendorId || !description || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'vendorId, description and amount required' }, { status: 400 })
    }
    const db = getDb()
    const ref = await db.collection('procurements').add({
      vendorId,
      description,
      amount,
      status: 'requested',
      requestedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    console.error('Procurements POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create procurement request' }, { status: 500 })
  }
}


