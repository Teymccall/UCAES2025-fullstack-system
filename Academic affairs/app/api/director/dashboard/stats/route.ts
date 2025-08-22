import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { withAuthorization } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';

const getDashboardStats = async (req: Request) => {
  try {
    console.log('🔍 Starting getDashboardStats...');
    console.log('🔍 About to call getDb()...');
    
    const adminDb = getDb();
    
    console.log('🔍 getDb() returned:', adminDb);
    console.log('🔍 adminDb type:', typeof adminDb);
    console.log('🔍 adminDb has collection method:', typeof adminDb?.collection);
    console.log('🔍 adminDb constructor name:', adminDb?.constructor?.name);
    
    if (!adminDb) {
      throw new Error('getDb() returned null or undefined');
    }
    
    if (typeof adminDb.collection !== 'function') {
      throw new Error(`adminDb.collection is not a function. Type: ${typeof adminDb.collection}`);
    }
    
    // Fetch real data from Firebase
    const stats = {
      totalStudents: 0,
      pendingRegistrations: 0,
      pendingResults: 0,
      currentAcademicYear: '',
      totalStaff: 0,
      totalLecturers: 0,
    };

    // Get total students from student-registrations collection
    try {
      const studentsSnapshot = await adminDb.collection('student-registrations').get();
      stats.totalStudents = studentsSnapshot.size;
    } catch (error) {
      console.error('Error fetching total students:', error);
    }

    // Get pending registrations from course-registrations collection
    try {
      const registrationsSnapshot = await adminDb.collection('course-registrations')
        .where('status', '==', 'pending')
        .get();
      stats.pendingRegistrations = registrationsSnapshot.size;
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
    }

    // Get pending results from results collection
    try {
      const resultsSnapshot = await adminDb.collection('results')
        .where('status', '==', 'pending')
        .get();
      stats.pendingResults = resultsSnapshot.size;
    } catch (error) {
      console.error('Error fetching pending results:', error);
    }



    // Get current academic year
    try {
      const academicYearsSnapshot = await adminDb.collection('academic-years')
        .where('status', '==', 'active')
        .orderBy('year', 'desc')
        .limit(1)
        .get();
      
      if (!academicYearsSnapshot.empty) {
        const currentYear = academicYearsSnapshot.docs[0].data();
        stats.currentAcademicYear = currentYear.year || new Date().getFullYear().toString();
      } else {
        // Fallback: try to get any academic year
        const anyYearSnapshot = await adminDb.collection('academic-years')
          .orderBy('year', 'desc')
          .limit(1)
          .get();
        
        if (!anyYearSnapshot.empty) {
          const anyYear = anyYearSnapshot.docs[0].data();
          stats.currentAcademicYear = anyYear.year || new Date().getFullYear().toString();
        } else {
          stats.currentAcademicYear = new Date().getFullYear().toString();
        }
      }
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      stats.currentAcademicYear = new Date().getFullYear().toString();
    }

    // Get total staff count from staff collection
    try {
      const staffSnapshot = await adminDb.collection('staff').get();
      stats.totalStaff = staffSnapshot.size;
    } catch (error) {
      console.error('Error fetching staff count:', error);
      // Try alternative collection name
      try {
        const staffSnapshot = await adminDb.collection('staff-members').get();
        stats.totalStaff = staffSnapshot.size;
      } catch (altError) {
        console.error('Error fetching staff from alternative collection:', altError);
        stats.totalStaff = 0;
      }
    }

    // Get total lecturers count (from staff with lecturer position)
    try {
      const lecturersSnapshot = await adminDb.collection('staff')
        .where('position', '==', 'Lecturer')
        .get();
      stats.totalLecturers = lecturersSnapshot.size;
    } catch (error) {
      console.error('Error fetching lecturers count:', error);
      // Try alternative collection name
      try {
        const lecturersSnapshot = await adminDb.collection('staff-members')
          .where('position', '==', 'Lecturer')
          .get();
        stats.totalLecturers = lecturersSnapshot.size;
      } catch (altError) {
        console.error('Error fetching lecturers from alternative collection:', altError);
        stats.totalLecturers = 0;
      }
    }

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching dashboard stats.' },
      { status: 500 }
    );
  }
}

export const GET = withAuthorization(PERMISSIONS.view_dashboard)(getDashboardStats);