import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Parse query parameters
  const url = new URL(request.url);
  const studentId = url.searchParams.get('studentId');
  const registrationNumber = url.searchParams.get('registrationNumber');
  const courseCode = url.searchParams.get('courseCode');
  const academicYear = url.searchParams.get('academicYear');
  const semester = url.searchParams.get('semester');
  
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      query: {
        studentId,
        registrationNumber,
        courseCode,
        academicYear,
        semester
      }
    };
    
    // Find student
    if (registrationNumber) {
      const studentsRef = collection(db, 'students');
      const studentQuery = query(studentsRef, where('registrationNumber', '==', registrationNumber));
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        const studentData = studentDoc.data();
        results.student = {
          id: studentDoc.id,
          ...studentData
        };
      } else {
        results.student = null;
        results.message = 'Student not found with registration number';
      }
    } else if (studentId) {
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (studentDoc.exists()) {
        results.student = {
          id: studentDoc.id,
          ...studentDoc.data()
        };
      } else {
        results.student = null;
        results.message = 'Student not found with ID';
      }
    }
    
    // If we found a student, check their registrations
    if (results.student?.id) {
      // Check course-registrations
      const courseRegsRef = collection(db, 'course-registrations');
      const courseRegsQuery = query(courseRegsRef, where('studentId', '==', results.student.id));
      const courseRegsSnapshot = await getDocs(courseRegsQuery);
      
      results.courseRegistrations = [];
      courseRegsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Extract course details for easier debugging
        const courseDetails = data.courses && Array.isArray(data.courses) 
          ? data.courses.map((course: any) => {
              if (typeof course === 'string') {
                return { value: course, type: 'string' };
              } else {
                return { 
                  ...course, 
                  type: 'object',
                  possibleMatches: {
                    matchesByCourseId: courseCode && course.courseId === courseCode,
                    matchesByCourseCode: courseCode && course.courseCode === courseCode,
                    matchesByCode: courseCode && course.code === courseCode,
                    matchesById: courseCode && course.id === courseCode
                  }
                };
              }
            })
          : [];
          
        results.courseRegistrations.push({
          id: doc.id,
          ...data,
          courseDetails,
          yearMatches: academicYear ? {
            byAcademicYear: data.academicYear === academicYear,
            byAcademicYearId: data.academicYearId === academicYear
          } : null,
          semesterMatches: semester ? {
            bySemester: data.semester === semester,
            bySemesterId: data.semesterId === semester,
            byAcademicSemesterId: data.academicSemesterId === semester
          } : null
        });
      });
      
      // Check old registrations format
      const regsRef = collection(db, 'registrations');
      const regsQuery = query(regsRef, where('studentId', '==', results.student.id));
      const regsSnapshot = await getDocs(regsQuery);
      
      results.registrations = [];
      regsSnapshot.forEach(doc => {
        const data = doc.data();
        
        // Extract course details for easier debugging
        const courseDetails = data.courses && Array.isArray(data.courses) 
          ? data.courses.map((course: any) => {
              if (typeof course === 'string') {
                return { value: course, type: 'string' };
              } else {
                return { 
                  ...course, 
                  type: 'object',
                  possibleMatches: {
                    matchesByCourseId: courseCode && course.courseId === courseCode,
                    matchesByCourseCode: courseCode && course.courseCode === courseCode,
                    matchesByCode: courseCode && course.code === courseCode,
                    matchesById: courseCode && course.id === courseCode
                  }
                };
              }
            })
          : [];
          
        results.registrations.push({
          id: doc.id,
          ...data,
          courseDetails,
          yearMatches: academicYear ? {
            byAcademicYear: data.academicYear === academicYear,
            byAcademicYearId: data.academicYearId === academicYear
          } : null,
          semesterMatches: semester ? {
            bySemester: data.semester === semester,
            bySemesterId: data.semesterId === semester,
            byAcademicSemesterId: data.academicSemesterId === semester
          } : null
        });
      });
      
      // If still not found, try by registration number
      if (registrationNumber && results.registrations.length === 0) {
        const regsByNumberQuery = query(regsRef, where('registrationNumber', '==', registrationNumber));
        const regsByNumberSnapshot = await getDocs(regsByNumberQuery);
        
        regsByNumberSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Extract course details for easier debugging
          const courseDetails = data.courses && Array.isArray(data.courses) 
            ? data.courses.map((course: any) => {
                if (typeof course === 'string') {
                  return { value: course, type: 'string' };
                } else {
                  return { 
                    ...course, 
                    type: 'object',
                    possibleMatches: {
                      matchesByCourseId: courseCode && course.courseId === courseCode,
                      matchesByCourseCode: courseCode && course.courseCode === courseCode,
                      matchesByCode: courseCode && course.code === courseCode,
                      matchesById: courseCode && course.id === courseCode
                    }
                  };
                }
              })
            : [];
          
          results.registrations.push({
            id: doc.id,
            ...data,
            courseDetails,
            yearMatches: academicYear ? {
              byAcademicYear: data.academicYear === academicYear,
              byAcademicYearId: data.academicYearId === academicYear
            } : null,
            semesterMatches: semester ? {
              bySemester: data.semester === semester,
              bySemesterId: data.semesterId === semester,
              byAcademicSemesterId: data.academicSemesterId === semester
            } : null,
            note: 'Found by registrationNumber'
          });
        });
      }
    }
    
    // If courseCode provided, look for lecturer assignments
    if (courseCode) {
      const assignmentsRef = collection(db, 'lecturer-assignments');
      
      // Try with both courseId and courseCode fields
      const byCodeQuery = query(assignmentsRef, where('courseCode', '==', courseCode));
      const byIdQuery = query(assignmentsRef, where('courseId', '==', courseCode));
      
      const [byCodeSnapshot, byIdSnapshot] = await Promise.all([
        getDocs(byCodeQuery),
        getDocs(byIdQuery)
      ]);
      
      results.lecturerAssignments = [];
      
      byCodeSnapshot.forEach(doc => {
        const data = doc.data();
        results.lecturerAssignments.push({
          id: doc.id,
          ...data,
          foundBy: 'courseCode',
          yearMatches: academicYear ? {
            byAcademicYear: data.academicYear === academicYear,
            byAcademicYearId: data.academicYearId === academicYear
          } : null,
          semesterMatches: semester ? {
            bySemester: data.semester === semester,
            bySemesterId: data.semesterId === semester,
            byAcademicSemesterId: data.academicSemesterId === semester
          } : null
        });
      });
      
      byIdSnapshot.forEach(doc => {
        const data = doc.data();
        results.lecturerAssignments.push({
          id: doc.id,
          ...data,
          foundBy: 'courseId',
          yearMatches: academicYear ? {
            byAcademicYear: data.academicYear === academicYear,
            byAcademicYearId: data.academicYearId === academicYear
          } : null,
          semesterMatches: semester ? {
            bySemester: data.semester === semester,
            bySemesterId: data.semesterId === semester,
            byAcademicSemesterId: data.academicSemesterId === semester
          } : null
        });
      });
    }
    
    // Add available academic years and semesters
    try {
      const yearsRef = collection(db, 'academic-years');
      const yearsSnapshot = await getDocs(yearsRef);
      
      results.academicYears = [];
      yearsSnapshot.forEach(doc => {
        const data = doc.data();
        results.academicYears.push({
          id: doc.id,
          ...data,
          isActive: data.status === 'active'
        });
      });
      
      const semestersRef = collection(db, 'academic-semesters');
      const semestersSnapshot = await getDocs(semestersRef);
      
      results.academicSemesters = [];
      semestersSnapshot.forEach(doc => {
        const data = doc.data();
        results.academicSemesters.push({
          id: doc.id,
          ...data,
          isActive: data.status === 'active'
        });
      });
    } catch (error) {
      console.error('Error fetching academic data:', error);
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 