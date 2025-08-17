import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programme = searchParams.get('programme') || undefined
    const departmentId = searchParams.get('departmentId') || undefined
    const db = getDb()
    let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('fee-structures')
    if (programme) q = q.where('programme', '==', programme)
    if (departmentId) q = q.where('departmentId', '==', departmentId)
    const snap = await q.orderBy('createdAt', 'desc').get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('FeeStructures GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load fee structures' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Support both programme-based and official mode/level structures
    const {
      programme,
      departmentId,
      level,
      year,
      amount,
      items = [],
      studyMode,
      total,
      firstPayment,
      secondPayment,
      thirdPayment,
      createdBy = 'system'
    } = body || {}

    if (!year) {
      return NextResponse.json({ success: false, error: 'year required' }, { status: 400 })
    }

    // Basic shape inference
    const data: any = {
      year,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }
    if (programme || departmentId) {
      if (!programme || !departmentId || !level || typeof amount !== 'number') {
        return NextResponse.json({ success: false, error: 'programme, departmentId, level, amount required for programme-based structure' }, { status: 400 })
      }
      Object.assign(data, { programme, departmentId, level, amount, items })
    }
    if (studyMode || total || firstPayment || secondPayment || thirdPayment) {
      if (!studyMode || !level || typeof total !== 'number' || typeof firstPayment !== 'number' || typeof secondPayment !== 'number') {
        return NextResponse.json({ success: false, error: 'studyMode, level, total, firstPayment, secondPayment required for official structure' }, { status: 400 })
      }
      Object.assign(data, { studyMode, level, total, firstPayment, secondPayment, thirdPayment: typeof thirdPayment === 'number' ? thirdPayment : null })
    }

    const db = getDb()
    const ref = await db.collection('fee-structures').add(data)
    const doc = await ref.get()
    return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    console.error('FeeStructures POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to create fee structure' }, { status: 500 })
  }
}


