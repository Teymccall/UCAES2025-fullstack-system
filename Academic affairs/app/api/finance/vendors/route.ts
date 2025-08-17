import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const db = getDb()
    const snap = await db.collection('vendors').get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Vendors GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load vendors' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, category, address, createdBy = 'system' } = body || {}
    if (!name) return NextResponse.json({ success: false, error: 'name required' }, { status: 400 })
    const db = getDb()
    const ref = await db.collection('vendors').add({
      name,
      email: email || null,
      phone: phone || null,
      category: category || 'general',
      address: address || null,
      status: 'active',
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    console.error('Vendors POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create vendor' }, { status: 500 })
  }
}


