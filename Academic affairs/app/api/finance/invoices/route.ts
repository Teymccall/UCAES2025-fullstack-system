import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || undefined
    const db = getDb()
    let q = db.collection('tuition-invoices')
    if (studentId) q = q.where('studentId', '==', studentId)
    const snap = await q.get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Invoices GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, studentName, programmeId, academicYear, semester, items = [], currency = 'GHS', createdBy = 'system' } = body || {}
    if (!studentId || !academicYear || !semester || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'studentId, academicYear, semester and items[] required' }, { status: 400 })
    }

    const sanitizedItems = items
      .filter((i: any) => i && typeof i.name === 'string')
      .map((i: any) => ({ name: String(i.name).trim(), amount: Number(i.amount || 0) }))
      .filter((i: any) => i.amount > 0)

    const total = sanitizedItems.reduce((sum: number, i: any) => sum + Number(i.amount || 0), 0)
    if (total <= 0) {
      return NextResponse.json({ success: false, error: 'At least one positive line item is required' }, { status: 400 })
    }
    const payload = {
      studentId: String(studentId).trim(),
      studentName: studentName ? String(studentName).trim() : null,
      programmeId: programmeId || null,
      academicYear,
      semester,
      items: sanitizedItems,
      total,
      balance: total,
      currency,
      status: 'unpaid',
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const db = getDb()
    const ref = await db.collection('tuition-invoices').add(payload)
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: ref.id, ...doc.data() } })
  } catch (error: any) {
    console.error('Invoices POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create invoice' }, { status: 500 })
  }
}


