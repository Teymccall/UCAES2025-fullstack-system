import { NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function POST() {
  try {
    const adminDb = getDb();
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Seeding disabled in production' }, { status: 403 })
    }

    // Idempotency: skip if already seeded
    const metaRef = adminDb.collection('metadata').doc('seeded-finance-v1')
    const metaDoc = await metaRef.get()
    if (metaDoc.exists) {
      return NextResponse.json({ success: true, message: 'Already seeded' })
    }

    const batch = adminDb.batch()
    const now = new Date().toISOString()

    // Budgets
    const budgetsCol = adminDb.collection('budgets')
    ;[
      { departmentId: 'ENG', year: '2025/2026', amount: 500000, usedAmount: 125000 },
      { departmentId: 'SCI', year: '2025/2026', amount: 400000, usedAmount: 98000 },
    ].forEach((b) => {
      const ref = budgetsCol.doc()
      batch.set(ref, { ...b, createdAt: now, updatedAt: now })
    })

    // Vendors
    const vendorsCol = adminDb.collection('vendors')
    const vendorRefs: FirebaseFirestore.DocumentReference[] = []
    ;[
      { name: 'Tech Supplies Ltd', category: 'IT', phone: '020-000-0001', email: 'info@techsupplies.com', address: 'Accra' },
      { name: 'Campus Utilities Co', category: 'Utilities', phone: '020-000-0002', email: 'support@campusutils.com', address: 'Kumasi' },
    ].forEach((v) => {
      const ref = vendorsCol.doc(); vendorRefs.push(ref)
      batch.set(ref, { ...v, status: 'active', createdAt: now, updatedAt: now })
    })

    // Procurements
    const procsCol = adminDb.collection('procurements')
    ;[
      { vendorIdx: 0, description: 'Department laptops (5 units)', amount: 25000 },
      { vendorIdx: 1, description: 'Utility meters maintenance', amount: 8000 },
    ].forEach((p) => {
      const ref = procsCol.doc()
      batch.set(ref, {
        vendorId: vendorRefs[p.vendorIdx].id,
        description: p.description,
        amount: p.amount,
        status: 'requested',
        requestedBy: 'seed',
        createdAt: now, updatedAt: now,
      })
    })

    // Payroll (draft)
    const payrollCol = adminDb.collection('payroll')
    ;[
      { staffName: 'Alice Mensah', baseSalary: 4500, allowances: 500, deductions: 200, month: now.slice(0,7) },
      { staffName: 'Kofi Owusu', baseSalary: 5200, allowances: 700, deductions: 300, month: now.slice(0,7) },
    ].forEach((p) => {
      const ref = payrollCol.doc()
      const netPay = (p.baseSalary||0) + (p.allowances||0) - (p.deductions||0)
      batch.set(ref, { ...p, netPay, status: 'draft', createdAt: now, updatedAt: now })
    })

    // Fee Structures
    const feesCol = adminDb.collection('fee-structures')
    ;[
      { programme: 'BSc Computer Science', departmentId: 'ENG', level: 'L100', year: '2025/2026', amount: 4900, items: ['Tuition','ICT Levy'] },
      { programme: 'BSc Biology', departmentId: 'SCI', level: 'L200', year: '2025/2026', amount: 4600, items: ['Tuition','Lab Fee'] },
    ].forEach((f) => {
      const ref = feesCol.doc()
      batch.set(ref, { ...f, isActive: true, createdAt: now, updatedAt: now })
    })

    // Scholarships
    const scholCol = adminDb.collection('scholarships')
    ;[
      { studentId: 'STD001', name: 'STEM Grant', type: 'grant', amount: 1000, year: '2025', status: 'applied' },
      { studentId: 'STD002', name: 'Merit Scholarship', type: 'scholarship', amount: 2000, year: '2025', status: 'applied' },
    ].forEach((s) => {
      const ref = scholCol.doc()
      batch.set(ref, { ...s, createdAt: now, updatedAt: now })
    })

    // Invoices
    const invCol = adminDb.collection('tuition-invoices')
    ;[
      { studentId: 'STD001', studentName: 'Ama Boateng', academicYear: '2025/2026', semester: 'First Semester', items: [{ name: 'Tuition', amount: 2450 }], total: 2450, balance: 2450, status: 'pending' },
      { studentId: 'STD002', studentName: 'Yaw Asare', academicYear: '2025/2026', semester: 'First Semester', items: [{ name: 'Tuition', amount: 2450 }], total: 2450, balance: 1450, status: 'partial' },
    ].forEach((inv) => {
      const ref = invCol.doc()
      batch.set(ref, { ...inv, createdAt: now, updatedAt: now })
    })

    // Finance transactions (revenue/expense)
    const txCol = adminDb.collection('finance-transactions')
    ;[
      { kind: 'revenue', type: 'tuition', amount: 10000, currency: 'GHS', description: 'Tuition receipts' },
      { kind: 'revenue', type: 'donation', amount: 5000, currency: 'GHS', description: 'Alumni donation' },
      { kind: 'expense', type: 'salary', amount: 7000, currency: 'GHS', description: 'Monthly payroll' },
    ].forEach((t) => {
      const ref = txCol.doc()
      batch.set(ref, { ...t, date: now, createdBy: 'seed', createdAt: now, status: 'posted' })
    })

    // Internal transfers
    const transfersCol = adminDb.collection('internal-transfers')
    const trRef = transfersCol.doc()
    batch.set(trRef, { fromDepartmentId: 'ENG', toDepartmentId: 'SCI', amount: 20000, reason: 'Lab expansion', status: 'pending', requestedBy: 'seed', createdAt: now, updatedAt: now })

    // Mark seeded
    batch.set(metaRef, { createdAt: now })

    await batch.commit()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to seed' }, { status: 500 })
  }
}






