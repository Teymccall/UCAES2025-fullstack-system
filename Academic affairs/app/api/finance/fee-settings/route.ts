import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

function yearDocId(year?: string | null) {
  const y = year || new Date().getFullYear().toString()
  return (y.includes('/') ? y.replace(/\//g, '-') : y)
}

export async function GET(request: Request) {
  try {
    const adminDb = getDb();
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const id = yearDocId(year || undefined)
    const ref = adminDb.collection('fee-settings').doc(id)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ success: true, data: {
        year: year || new Date().getFullYear().toString(),
        regular: { split: [50, 50] },
        weekend: { split: [40, 30, 30] },
        publishToPortal: true,
      } })
    }
    return NextResponse.json({ success: true, data: { id: snap.id, ...snap.data() } })
  } catch (error: any) {
    console.error('Fee-settings GET error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load fee settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminDb = getDb();
    const body = await request.json()
    const { year, regular, weekend, publishToPortal = true, updatedBy = 'system' } = body || {}
    const id = yearDocId(year)
    const ref = adminDb.collection('fee-settings').doc(id)
    const payload = {
      year: year || new Date().getFullYear().toString(),
      regular: { split: Array.isArray(regular?.split) ? regular.split : [50, 50] },
      weekend: { split: Array.isArray(weekend?.split) ? weekend.split : [40, 30, 30] },
      publishToPortal: !!publishToPortal,
      updatedBy,
      updatedAt: new Date().toISOString(),
    }
    await ref.set(payload, { merge: true })
    const docSnap = await ref.get()
    return NextResponse.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } })
  } catch (error: any) {
    console.error('Fee-settings POST error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save fee settings' }, { status: 500 })
  }
}






