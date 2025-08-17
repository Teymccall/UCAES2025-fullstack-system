import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const adminDb = getDb();
    const approvals: any[] = [];

    // Fetch pending course registrations
    try {
      const registrationsSnapshot = await adminDb.collection('course-registrations')
        .where('status', '==', 'pending')
        .orderBy('registrationDate', 'desc')
        .limit(5)
        .get();

      registrationsSnapshot.forEach(doc => {
        const data = doc.data();
        approvals.push({
          id: doc.id,
          type: "Course Registration",
          student: `${data.studentName || 'Unknown Student'}`,
          course: data.courses?.map((c: any) => c.courseCode).join(', ') || 'No courses',
          status: data.status,
          timestamp: data.registrationDate?.toDate() || new Date(),
          registrationId: doc.id
        });
      });
    } catch (error) {
      console.error('Error fetching pending course registrations:', error);
    }

    // Fetch pending student registrations
    try {
      const studentRegistrationsSnapshot = await adminDb.collection('student-registrations')
        .where('status', '==', 'pending')
        .orderBy('registrationDate', 'desc')
        .limit(5)
        .get();

      studentRegistrationsSnapshot.forEach(doc => {
        const data = doc.data();
        approvals.push({
          id: doc.id,
          type: "Student Registration",
          student: `${data.surname} ${data.otherNames}`,
          course: data.programme || 'No program',
          status: data.status,
          timestamp: data.registrationDate?.toDate() || new Date(),
          registrationId: doc.id
        });
      });
    } catch (error) {
      console.error('Error fetching pending student registrations:', error);
    }

    // Fetch pending results
    try {
      const resultsSnapshot = await adminDb.collection('results')
        .where('status', '==', 'pending')
        .orderBy('submittedAt', 'desc')
        .limit(5)
        .get();

      resultsSnapshot.forEach(doc => {
        const data = doc.data();
        approvals.push({
          id: doc.id,
          type: "Result Approval",
          staff: data.submittedBy || 'Unknown Staff',
          course: data.courseCode || 'Unknown Course',
          status: data.status,
          timestamp: data.submittedAt?.toDate() || new Date(),
          resultId: doc.id
        });
      });
    } catch (error) {
      console.error('Error fetching pending results:', error);
    }

    // Sort by timestamp (most recent first)
    approvals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, approvals: approvals.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching pending approvals.' },
      { status: 500 }
    );
  }
} 