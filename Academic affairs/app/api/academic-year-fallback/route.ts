import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching academic year directly from collections...');
    
    // Find active academic year directly from academic-years collection
    const yearQuery = query(
      collection(db, "academic-years"), 
      where("status", "==", "active")
    );
    const yearSnapshot = await getDocs(yearQuery);
    
    if (yearSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No active academic year found',
        data: null
      });
    }
    
    const activeYear = yearSnapshot.docs[0];
    const yearData = activeYear.data();
    console.log(`✅ Found active year: ${yearData.year}`);
    
    // Try to find active Regular semester for this year
    const semesterQuery = query(
      collection(db, "semesters"),
      where("yearId", "==", activeYear.id),
      where("status", "==", "active"),
      where("programType", "==", "Regular")
    );
    const semesterSnapshot = await getDocs(semesterQuery);
    
    let semesterName = 'First Semester'; // Default fallback
    if (!semesterSnapshot.empty) {
      const activeSemester = semesterSnapshot.docs[0];
      const semesterData = activeSemester.data();
      semesterName = semesterData.name;
      console.log(`✅ Found active semester: ${semesterName}`);
    } else {
      console.log('⚠️ No active Regular semester found, using default');
    }
    
    return NextResponse.json({
      success: true,
      data: {
        academicYear: yearData.year,
        semester: semesterName,
        status: 'direct_query',
        message: 'Data retrieved directly from collections'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching academic year:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch academic year information',
      data: null
    });
  }
}


