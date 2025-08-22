import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { withAuthorization } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';

const getRecentActivities = async (req: Request) => {
  try {
    const activities: any[] = [];

    // Fetch recent course registrations
    try {
      const registrationsSnapshot = await getDb().collection('course-registrations')
        .orderBy('registrationDate', 'desc')
        .limit(10)
        .get();

      registrationsSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          action: "COURSE_REGISTRATION_SUBMITTED",
          details: `Course registration submitted by ${data.studentName || 'Unknown Student'}`,
          timestamp: data.registrationDate?.toDate() || new Date(),
          type: data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'warning' : 'info'
        });
      });
    } catch (error) {
      console.error('Error fetching course registrations:', error);
    }

    // Fetch recent student registrations
    try {
      const studentRegistrationsSnapshot = await getDb().collection('student-registrations')
        .orderBy('registrationDate', 'desc')
        .limit(10)
        .get();

      studentRegistrationsSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          action: "STUDENT_REGISTRATION_SUBMITTED",
          details: `Student registration submitted by ${data.surname} ${data.otherNames}`,
          timestamp: data.registrationDate?.toDate() || new Date(),
          type: data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'warning' : 'info'
        });
      });
    } catch (error) {
      console.error('Error fetching student registrations:', error);
    }

    // Fetch recent results submissions
    try {
      const resultsSnapshot = await getDb().collection('results')
        .orderBy('submittedAt', 'desc')
        .limit(10)
        .get();

      resultsSnapshot.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          action: "RESULTS_SUBMITTED",
          details: `Results submitted for ${data.courseCode || 'Unknown Course'} by ${data.submittedBy || 'Unknown Staff'}`,
          timestamp: data.submittedAt?.toDate() || new Date(),
          type: data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'warning' : 'info'
        });
      });
    } catch (error) {
      console.error('Error fetching results:', error);
    }

    // Fetch recent course updates
    try {
      const coursesSnapshot = await getDb().collection('courses')
        .orderBy('updatedAt', 'desc')
        .limit(10)
        .get();

      coursesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.updatedAt) {
          activities.push({
            id: doc.id,
            action: "COURSE_UPDATED",
            details: `Course ${data.code || 'Unknown'} updated`,
            timestamp: data.updatedAt?.toDate() || new Date(),
            type: 'info'
          });
        }
      });
    } catch (error) {
      console.error('Error fetching course updates:', error);
    }

    // Sort by timestamp (most recent first) and take top 15
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, activities: activities.slice(0, 15) });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching recent activities.' },
      { status: 500 }
    );
  }
}

export const GET = withAuthorization(PERMISSIONS.view_dashboard)(getRecentActivities);