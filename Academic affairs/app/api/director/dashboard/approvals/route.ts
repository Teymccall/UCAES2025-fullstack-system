import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { withAuthorization } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';

const getPendingApprovals = async (req: Request) => {
  try {
    const approvals: any[] = [];

    // Fetch pending course registrations
    try {
      const registrationsSnapshot = await getDocs(
        query(
          collection(db, 'course-registrations'),
          where('status', '==', 'pending'),
          orderBy('registrationDate', 'desc'),
          limit(5)
        )
      );

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
      const studentRegistrationsSnapshot = await getDocs(
        query(
          collection(db, 'student-registrations'),
          where('status', '==', 'pending'),
          orderBy('registrationDate', 'desc'),
          limit(5)
        )
      );

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
      const resultsSnapshot = await getDocs(
        query(
          collection(db, 'results'),
          where('status', '==', 'pending'),
          orderBy('submittedAt', 'desc'),
          limit(5)
        )
      );

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

export const GET = withAuthorization(PERMISSIONS.view_dashboard)(getPendingApprovals);