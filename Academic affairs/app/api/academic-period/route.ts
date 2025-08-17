import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching current academic period from Firebase...');
    
    // Method 1: Check centralized system config first
    try {
      const systemConfigRef = doc(db, "systemConfig", "academicPeriod");
      const systemConfigDoc = await getDoc(systemConfigRef);
      
      if (systemConfigDoc.exists()) {
        const systemData = systemConfigDoc.data();
        console.log('✅ Found centralized academic period:', systemData);
        
        return NextResponse.json({
          success: true,
          data: {
            academicYear: systemData.currentAcademicYear || systemData.academicYear,
            semester: systemData.currentSemester || systemData.semester,
            status: 'active'
          }
        });
      }
    } catch (error) {
      console.log('⚠️ No centralized config found, checking collections...');
    }
    
    // Method 2: Find current academic year from academic-years collection
    const yearQuery = query(
      collection(db, "academic-years"), 
      where("current", "==", true)
    );
    const yearSnapshot = await getDocs(yearQuery);
    
    let currentYear = null;
    if (!yearSnapshot.empty) {
      currentYear = yearSnapshot.docs[0].data();
      console.log('✅ Found current academic year:', currentYear.year);
    } else {
      // Fallback: get the most recent active year
      const activeYearQuery = query(
        collection(db, "academic-years"), 
        where("status", "==", "active")
      );
      const activeYearSnapshot = await getDocs(activeYearQuery);
      
      if (!activeYearSnapshot.empty) {
        currentYear = activeYearSnapshot.docs[0].data();
        console.log('📅 Using active academic year as fallback:', currentYear.year);
      }
    }
    
    // Method 3: Find current semester from academic-semesters collection
    const semesterQuery = query(
      collection(db, "academic-semesters"), 
      where("current", "==", true)
    );
    const semesterSnapshot = await getDocs(semesterQuery);
    
    let currentSemester = null;
    if (!semesterSnapshot.empty) {
      currentSemester = semesterSnapshot.docs[0].data();
      console.log('✅ Found current semester:', currentSemester.name);
    } else {
      // Fallback: get the most recent active semester
      const activeSemesterQuery = query(
        collection(db, "academic-semesters"), 
        where("status", "==", "active")
      );
      const activeSemesterSnapshot = await getDocs(activeSemesterQuery);
      
      if (!activeSemesterSnapshot.empty) {
        currentSemester = activeSemesterSnapshot.docs[0].data();
        console.log('📅 Using active semester as fallback:', currentSemester.name);
      }
    }
    
    // Prepare response
    const academicYear = currentYear?.year || '2025/2026';
    const semester = currentSemester?.name || 'First Semester';
    
    console.log('📊 Final academic period:', { academicYear, semester });
    
    return NextResponse.json({
      success: true,
      data: {
        academicYear,
        semester,
        status: 'active'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching academic period:', error);
    
    // Return safe defaults if everything fails
    return NextResponse.json({
      success: true,
      data: {
        academicYear: '2025/2026',
        semester: 'First Semester',
        status: 'default'
      }
    });
  }
} 