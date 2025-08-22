import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching current academic period from Firebase...');
    
    // Method 1: Check centralized system config first
    try {
      console.log('🎯 Checking systemConfig/academicPeriod document...');
      const systemConfigRef = doc(db, "systemConfig", "academicPeriod");
      const systemConfigDoc = await getDoc(systemConfigRef);
      
      console.log('📄 Document exists:', systemConfigDoc.exists());
      
      if (systemConfigDoc.exists()) {
        const systemData = systemConfigDoc.data();
        console.log('✅ Found centralized academic period:', systemData);
        
        // Extract the actual academic year and semester from the director's settings
        const academicYear = systemData.currentAcademicYear || systemData.academicYear;
        const semester = systemData.currentSemester || systemData.semester;
        
        console.log('📊 Using centralized settings:', { academicYear, semester });
        
        return NextResponse.json({
          success: true,
          data: {
            academicYear,
            semester,
            status: 'centralized'
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
    
    // Method 3: Find current semester from semesters collection
    const semesterQuery = query(
      collection(db, "semesters"), 
      where("isCurrentSemester", "==", true)
    );
    const semesterSnapshot = await getDocs(semesterQuery);
    
    let currentSemester = null;
    if (!semesterSnapshot.empty) {
      currentSemester = semesterSnapshot.docs[0].data();
      console.log('✅ Found current semester:', currentSemester.name);
    } else {
      // Fallback: get the most recent active semester
      const activeSemesterQuery = query(
        collection(db, "semesters"), 
        where("status", "==", "active")
      );
      const activeSemesterSnapshot = await getDocs(activeSemesterQuery);
      
      if (!activeSemesterSnapshot.empty) {
        currentSemester = activeSemesterSnapshot.docs[0].data();
        console.log('📅 Using active semester as fallback:', currentSemester.name);
      }
    }
    
    // Prepare response
    const academicYear = currentYear?.year;
    const semester = currentSemester?.name;
    
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
    
    // Return error if everything fails - do not provide fallback data that overrides director settings
    return NextResponse.json({
      success: false,
      error: 'No academic period configured. Please ask the director to set the current academic year.',
      data: null
    });
  }
} 