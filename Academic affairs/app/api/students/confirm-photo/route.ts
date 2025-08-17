import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const adminDb = getDb();
    const { searchParams } = new URL(request.url)
    const reg = (searchParams.get('registrationNumber') || searchParams.get('reg') || '').toUpperCase()

    let targetReg = reg
    let registrationDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null

    const registrationsRef = adminDb.collection('student-registrations')

    if (targetReg) {
      const q = await registrationsRef.where('registrationNumber', '==', targetReg).limit(1).get()
      if (!q.empty) {
        registrationDoc = q.docs[0]
      }
    }

    if (!registrationDoc) {
      // Fallback: get the most recent by registrationDate
      const q = await registrationsRef.orderBy('registrationDate', 'desc').limit(1).get()
      if (!q.empty) {
        registrationDoc = q.docs[0]
        targetReg = (registrationDoc.data().registrationNumber || '').toUpperCase()
      }
    }

    if (!registrationDoc) {
      return NextResponse.json({ success: false, error: 'No registration found' }, { status: 404 })
    }

    const regData = registrationDoc.data()

    // Try to find matching student in students collection
    let studentDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null
    const studentsRef = adminDb.collection('students')

    // First, try by email document id (we sometimes save with email as doc id)
    if (regData.email) {
      const byEmail = await studentsRef.doc(regData.email.toLowerCase()).get()
      if (byEmail.exists) {
        studentDoc = byEmail as any
      }
    }

    if (!studentDoc) {
      const byReg = await studentsRef.where('registrationNumber', '==', targetReg).limit(1).get()
      if (!byReg.empty) {
        studentDoc = byReg.docs[0]
      }
    }

    const studentData = studentDoc ? studentDoc.data() : null

    const result = {
      registrationNumber: targetReg,
      studentRegistrations: {
        id: registrationDoc.id,
        profilePictureUrl: regData.profilePictureUrl || null,
        profilePicturePublicId: regData.profilePicturePublicId || null,
        email: regData.email || null,
        name: `${regData.surname || ''} ${regData.otherNames || ''}`.trim(),
      },
      students: studentDoc ? {
        id: studentDoc.id,
        profilePictureUrl: studentData?.profilePictureUrl || null,
        profilePicturePublicId: studentData?.profilePicturePublicId || null,
        email: studentData?.email || null,
        name: `${studentData?.surname || ''} ${studentData?.otherNames || ''}`.trim(),
      } : null
    }

    // Quick boolean flags
    const inStudentRegistrations = !!result.studentRegistrations.profilePictureUrl
    const inStudents = !!(result.students && result.students.profilePictureUrl)
    const urlsMatch = inStudentRegistrations && inStudents && (result.studentRegistrations.profilePictureUrl === result.students!.profilePictureUrl)

    return NextResponse.json({
      success: true,
      registrationNumber: targetReg,
      inStudentRegistrations,
      inStudents,
      urlsMatch,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}




























