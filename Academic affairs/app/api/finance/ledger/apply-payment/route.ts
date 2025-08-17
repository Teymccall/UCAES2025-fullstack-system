import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

// Applies a payment to an invoice and appends student ledger entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, invoiceId, amount, reference, method = 'Manual', createdBy = 'system' } = body || {}
    if (!studentId || !invoiceId || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'studentId, invoiceId and amount are required' }, { status: 400 })
    }

    const db = getDb()
    const invoiceRef = db.collection('tuition-invoices').doc(invoiceId)
    const invoiceDoc = await invoiceRef.get()
    if (!invoiceDoc.exists) return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    const inv: any = invoiceDoc.data()
    const newBalance = Math.max(0, Number(inv.balance || inv.total || 0) - amount)
    const status = newBalance === 0 ? 'paid' : 'partial'

    const batch = db.batch()
    // Update invoice
    batch.update(invoiceRef, { balance: newBalance, status, updatedAt: new Date().toISOString() })
    // Append ledger entry
    const ledgerRef = db.collection('student-ledger').doc()
    batch.set(ledgerRef, {
      studentId,
      invoiceId,
      amount,
      method,
      reference: reference || null,
      type: 'payment',
      createdBy,
      createdAt: new Date().toISOString(),
    })
    // Finance transaction
    const txRef = db.collection('finance-transactions').doc()
    batch.set(txRef, {
      kind: 'revenue',
      type: 'tuition',
      amount,
      currency: 'GHS',
      date: new Date().toISOString(),
      reference: reference || invoiceId,
      description: `Invoice payment for ${studentId}`,
      studentId,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'posted'
    })

    await batch.commit()
    return NextResponse.json({ success: true, data: { newBalance, status } })
  } catch (error: any) {
    console.error('Apply payment error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to apply payment' }, { status: 500 })
  }
}


