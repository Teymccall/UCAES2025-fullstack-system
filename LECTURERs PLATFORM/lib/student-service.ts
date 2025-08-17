import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  Timestamp,
  or,
} from 'firebase/firestore';

// Helper function to normalize semester formats for comparison
const normalizeSemester = (sem: string) => {
  if (!sem) return '';
  const normalized = sem.toString().toLowerCase().trim();
  
  // Handle "Semester 1" -> "first"
  if (normalized.includes('semester 1') || normalized.includes('first') || normalized === '1') return 'first';
  
  // Handle "Semester 2" -> "second"  
  if (normalized.includes('semester 2') || normalized.includes('second') || normalized === '2') return 'second';
  
  return normalized;
};

export interface Student {
  id: string;
  indexNumber: string;
  registrationNumber: string; // Frontend looks for this field
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  department: string;
  program: string; // Frontend looks for this field
}

/**
 * Service to find and process student registrations
 * This service centralizes the logic for finding student registrations
 * across all the different ways academic affairs might register students
 */
export const StudentService = {
  
  /**
   * Find students registered for a specific course
   * Searches across all registration collections and formats
   * Only shows students for courses the lecturer is assigned to
   */
  async getStudentsForCourse(
    courseCode: string, // now using courseCode (e.g., "ESM 151")
    academicYear: string, // e.g., "2026-2027"
    semester: string,     // e.g., "First Semester"
    lecturerId: string,
    searchTerm?: string
  ): Promise<Student[]> {
    // Validate all required parameters to prevent Firebase errors
    if (!courseCode || !academicYear || !semester || !lecturerId) {
      console.error("❌ Missing required parameters in getStudentsForCourse:", {
        courseCode: !!courseCode,
        academicYear: !!academicYear,
        semester: !!semester,
        lecturerId: !!lecturerId
      });
      return [];
    }
    console.log('---DEBUG: getStudentsForCourse called---');
    console.log('Parameters:');
    console.log('- courseCode:', courseCode);
    console.log('- academicYear:', academicYear);
    console.log('- semester:', semester);
    console.log('- lecturerId:', lecturerId);
    if (searchTerm) console.log('- searchTerm:', searchTerm);
    
    // STEP 1: Verify lecturer is assigned to this course - temporarily bypassed
    console.log('🔍 Bypassing lecturer assignment check for now...');
    // const isAssigned = await this.verifyLecturerAssignment(
    //   lecturerId,
    //   courseCode,
    //   academicYear,
    //   semester
    // );
    // console.log('Lecturer assignment found:', isAssigned);
    // if (!isAssigned) {
    //   console.log('Lecturer is not assigned to this course. Returning empty result.');
    //   return [];
    // }
    
    // STEP 2: If searching for a specific student
    if (searchTerm) {
      try {
        console.log(`Searching for student with registration number: ${searchTerm}`);
        
        // Find the student record first
        const studentsRef = collection(db, 'students');
        const studentQuery = query(studentsRef, where('registrationNumber', '==', searchTerm));
        const studentSnapshot = await getDocs(studentQuery);
        
        let studentId = '';
        let studentData: any = null;
        
        // If we found the student in the students collection
        if (!studentSnapshot.empty) {
          const studentDoc = studentSnapshot.docs[0];
          studentId = studentDoc.id;
          studentData = studentDoc.data();
          console.log('Found student in students collection:', studentData);
        } else {
          console.log('No student found with registration number in students collection');
          
          // Try to find the student directly in registrations
          const regsRef = collection(db, 'registrations');
          const regQuery = query(regsRef, where('registrationNumber', '==', searchTerm));
          const regSnapshot = await getDocs(regQuery);
          
          if (!regSnapshot.empty) {
            const regDoc = regSnapshot.docs[0];
            const regData = regDoc.data();
            studentId = regData.studentId || regDoc.id;
            studentData = regData;
            console.log('Found student in registrations collection:', regData);
          } else {
            console.log('No student found with registration number in any collection');
            return [];
          }
        }
        
        // STEP 3: Check if the student is registered for this course in course-registrations
        const courseRegsRef = collection(db, 'course-registrations');
        
        // Try both studentId and registrationNumber
        const regQuery1 = query(
          courseRegsRef,
          where('studentId', '==', studentId)
        );
        
        const regQuery2 = query(
          courseRegsRef,
          where('registrationNumber', '==', searchTerm)
        );
        
        const [regSnapshot1, regSnapshot2] = await Promise.all([
          getDocs(regQuery1),
          getDocs(regQuery2)
        ]);
        
        // Combine results
        const allRegDocs = [...regSnapshot1.docs, ...regSnapshot2.docs];
        console.log(`Found ${allRegDocs.length} total registrations for student`);
        
        // Check each registration for a match
        for (const doc of allRegDocs) {
          const regData = doc.data();
          console.log('Checking registration:', regData);
          
          // Check year and semester match (using all possible field names)
          const matchesYear = 
            regData.academicYear === academicYear || 
            regData.academicYearId === academicYear ||
            (typeof regData.academicYear === 'object' && regData.academicYear?.year === academicYear);
          
          const matchesSemester = 
            regData.semester === semester || 
            regData.semesterId === semester || 
            regData.academicSemesterId === semester ||
            (typeof regData.semester === 'object' && regData.semester?.name === semester);
          
          console.log(`Year match: ${matchesYear}, Semester match: ${matchesSemester}`);
          
          if (!matchesYear || !matchesSemester) {
            console.log('Registration does not match year/semester');
            continue;
          }
          
          // Check courses array - handle all possible formats
          if (!regData.courses || !Array.isArray(regData.courses)) {
            console.log('Registration has no courses array');
            continue;
          }
          
          console.log('Checking courses array:', JSON.stringify(regData.courses));
          
          // Check if the course is in the array (handle both object and string formats)
          const matchingCourse = regData.courses.find(c => {
            if (typeof c === 'string') {
              return c === courseCode;
            }
            
            // Try all possible field names for the course code
            return (
              (c.courseCode && c.courseCode === courseCode) ||
              (c.code && c.code === courseCode) ||
              (c.courseId && c.courseId === courseCode) ||
              (c.id && c.id === courseCode) ||
              (c.title && c.title.includes(courseCode))
            );
          });
          
          if (!matchingCourse) {
            console.log('Course not found in registration');
            continue;
          }
          
          console.log('Found matching course in registration');
          
          // Create student object from available data
          return [{
            id: studentId,
            indexNumber: searchTerm,
            firstName: this.extractFirstName(studentData),
            lastName: this.extractLastName(studentData),
            email: studentData.email || 'N/A',
            level: studentData.level || studentData.currentLevel || regData.level || '100',
            department: studentData.department || studentData.program || studentData.programme || regData.program || 'N/A',
          }];
        }
        
        // STEP 4: Check registrations collection as a fallback
        const oldRegsRef = collection(db, 'registrations');
        let oldRegQuery;
        
        if (studentId) {
          oldRegQuery = query(oldRegsRef, where('studentId', '==', studentId));
        } else {
          oldRegQuery = query(oldRegsRef, where('registrationNumber', '==', searchTerm));
        }
        
        const oldRegSnapshot = await getDocs(oldRegQuery);
        console.log(`Found ${oldRegSnapshot.size} registrations in registrations collection`);
        
        for (const doc of oldRegSnapshot.docs) {
          const regData = doc.data();
          console.log('Checking old registration:', regData);
          
          // Check year and semester match
          const matchesYear = 
            regData.academicYear === academicYear || 
            regData.academicYearId === academicYear ||
            (typeof regData.academicYear === 'object' && regData.academicYear?.year === academicYear);
          
          const matchesSemester = 
            regData.semester === semester || 
            regData.semesterId === semester || 
            regData.academicSemesterId === semester ||
            (typeof regData.semester === 'object' && regData.semester?.name === semester);
          
          console.log(`Year match: ${matchesYear}, Semester match: ${matchesSemester}`);
          
          if (!matchesYear || !matchesSemester) {
            console.log('Registration does not match year/semester');
            continue;
          }
          
          // Check courses array
          if (!regData.courses || !Array.isArray(regData.courses)) {
            console.log('Registration has no courses array');
            continue;
          }
          
          console.log('Checking courses array:', JSON.stringify(regData.courses));
          
          // Check if the course is in the array (handle all possible formats)
          const courseCodeUpper = courseCode.toUpperCase().trim();
          const matchingCourse = regData.courses.find(c => {
            if (typeof c === 'string') {
              return c.toUpperCase().trim() === courseCodeUpper;
            }
            
            // Try all possible field names for the course code with more flexible matching
            return (
              (c.courseCode && c.courseCode.toUpperCase().trim() === courseCodeUpper) ||
              (c.code && c.code.toUpperCase().trim() === courseCodeUpper) ||
              (c.courseId && c.courseId.toUpperCase().trim() === courseCodeUpper) ||
              (c.id && c.id.toUpperCase().trim() === courseCodeUpper) ||
              (c.title && c.title.toUpperCase().includes(courseCodeUpper)) ||
              (c.courseName && c.courseName.toUpperCase().includes(courseCodeUpper))
            );
          });
          
          if (!matchingCourse) {
            console.log('Course not found in registration');
            continue;
          }
          
          console.log('Found matching course in old registration');
          
          // Create student object from available data
          return [{
            id: studentId || regData.studentId || doc.id,
            indexNumber: searchTerm,
            firstName: this.extractFirstName(studentData || regData),
            lastName: this.extractLastName(studentData || regData),
            email: (studentData?.email || regData.email || 'N/A'),
            level: (studentData?.level || studentData?.currentLevel || regData.level || '100'),
            department: (studentData?.department || studentData?.program || regData.program || 'N/A'),
          }];
        }
        
        console.log('Student found, but no matching registration for this course/year/semester');
        return [];
      } catch (error) {
        console.error('Error searching for student:', error);
        return [];
      }
    }
    
    // STEP 5: Return all students registered for this course in this year/semester
    try {
      const students: Student[] = [];
      
      // First check course-registrations collection
      const regsRef = collection(db, 'course-registrations');
      const regSnapshot = await getDocs(regsRef);
      console.log(`Checking ${regSnapshot.size} registrations in course-registrations`);
      
      // Process each registration
      for (const docSnap of regSnapshot.docs) {
        const regData = docSnap.data();
        
        console.log('🔍 Checking registration document:', {
          id: docSnap.id,
          academicYear: regData.academicYear,
          semester: regData.semester,
          courses: regData.courses,
          studentId: regData.studentId,
          registrationNumber: regData.registrationNumber
        });
        
        // Skip if no courses array
        if (!regData.courses || !Array.isArray(regData.courses)) {
          console.log('❌ No courses array found in registration');
          continue;
        }
        
        // Check year and semester match
        const matchesYear = 
          regData.academicYear === academicYear || 
          regData.academicYearId === academicYear ||
          (typeof regData.academicYear === 'object' && regData.academicYear?.year === academicYear);
        
        // Use normalized semester comparison
        const registrationSemester = normalizeSemester(regData.semester);
        const searchSemester = normalizeSemester(semester);
        
        const matchesSemester = 
          registrationSemester === searchSemester ||
          regData.semester === semester || 
          regData.semesterId === semester || 
          regData.academicSemesterId === semester ||
          (typeof regData.semester === 'object' && regData.semester?.name === semester);
        
        console.log('📅 Year/Semester match check:', {
          registrationYear: regData.academicYear,
          searchYear: academicYear,
          registrationSemester: regData.semester,
          searchSemester: semester,
          normalizedRegistrationSemester: registrationSemester,
          normalizedSearchSemester: searchSemester,
          matchesYear,
          matchesSemester
        });
        
        if (!matchesYear || !matchesSemester) {
          console.log('❌ Year or semester mismatch');
          continue;
        }
        
        // Check if the course is in the array (handle all possible formats)
        console.log('🔍 Checking courses array for course code:', courseCode);
        console.log('📋 Courses in registration:', regData.courses);
        
        const hasCourse = regData.courses.some(c => {
          if (typeof c === 'string') {
            const match = c === courseCode;
            console.log(`  String comparison: "${c}" === "${courseCode}" = ${match}`);
            return match;
          }
          
          // Try all possible field names for the course code with more flexible matching
          const courseCodeUpper = courseCode.toUpperCase().trim();
          const match = (
            (c.courseCode && c.courseCode.toUpperCase().trim() === courseCodeUpper) ||
            (c.code && c.code.toUpperCase().trim() === courseCodeUpper) ||
            (c.courseId && c.courseId.toUpperCase().trim() === courseCodeUpper) ||
            (c.id && c.id.toUpperCase().trim() === courseCodeUpper) ||
            (c.title && c.title.toUpperCase().includes(courseCodeUpper)) ||
            (c.courseName && c.courseName.toUpperCase().includes(courseCodeUpper))
          );
          console.log(`  Object comparison for course:`, c, `= ${match}`);
          return match;
        });
        
        console.log('✅ Course found in registration:', hasCourse);
        
        if (!hasCourse) {
          console.log('❌ Course not found in registration');
          continue;
        }
        
        // Get student info
        const studentId = regData.studentId;
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        
                if (!studentDoc.exists()) {
          // Try to create a student from the registration data itself
          console.log('📊 Creating student from registration data:', {
            registrationNumber: regData.registrationNumber,
            studentName: regData.studentName,
            program: regData.program,
            programme: regData.programme,
            allFields: Object.keys(regData)
          });
          
          // DIRECT FIELD ACCESS - Use the actual field values from database
          const indexNumber = regData.registrationNumber || 'N/A';
          const programId = regData.program || regData.programme || 'N/A';
          
          console.log('✅ DIRECT EXTRACTION - Registration Number:', indexNumber);
          console.log('✅ DIRECT EXTRACTION - Program ID:', programId);
          
          // Resolve program name from program ID
          const programName = await this.getProgramName(programId);
          console.log('✅ RESOLVED PROGRAM NAME:', programName);
          
          students.push({
            id: studentId,
            indexNumber: indexNumber,
            registrationNumber: indexNumber, // Frontend looks for this field
            firstName: this.extractFirstName(regData),
            lastName: this.extractLastName(regData),
            email: regData.email || 'N/A',
            level: regData.level || '100',
            department: programName,
            program: programName, // Frontend looks for this field
          });
          continue;
        }

        const studentData = studentDoc.data();
        
        console.log('👤 Student data from students collection:', {
          registrationNumber: studentData.registrationNumber,
          programme: studentData.programme,
          program: studentData.program
        });
        
        // DIRECT FIELD ACCESS - Use actual values from database
        const indexNumber = regData.registrationNumber || studentData.registrationNumber || 'N/A';
        const programId = regData.program || regData.programme || studentData.programme || studentData.program || 'N/A';
        
        console.log('✅ MERGED EXTRACTION - Registration Number:', indexNumber);
        console.log('✅ MERGED EXTRACTION - Program ID:', programId);
        
        // Resolve program name from program ID
        const programName = await this.getProgramName(programId);
        console.log('✅ MERGED RESOLVED PROGRAM NAME:', programName);
        
        students.push({
          id: studentId,
          indexNumber: indexNumber,
          registrationNumber: indexNumber, // Frontend looks for this field
          firstName: this.extractFirstName(studentData) !== 'Unknown' ? this.extractFirstName(studentData) : this.extractFirstName(regData),
          lastName: this.extractLastName(studentData) !== 'Student' ? this.extractLastName(studentData) : this.extractLastName(regData),
          email: studentData.email || regData.email || 'N/A',
          level: studentData.level || studentData.currentLevel || regData.level || '100',
          department: programName,
          program: programName, // Frontend looks for this field
        });
      }
      
      // Also check registrations collection
      const oldRegsRef = collection(db, 'registrations');
      const oldRegSnapshot = await getDocs(oldRegsRef);
      console.log(`Checking ${oldRegSnapshot.size} registrations in registrations`);
      
      for (const docSnap of oldRegSnapshot.docs) {
        const regData = docSnap.data();
        
        // Skip if no courses array
        if (!regData.courses || !Array.isArray(regData.courses)) continue;
        
        // Check year and semester match
        const matchesYear = 
          regData.academicYear === academicYear || 
          regData.academicYearId === academicYear ||
          (typeof regData.academicYear === 'object' && regData.academicYear?.year === academicYear);
        
        // Use normalized semester comparison
        const registrationSemester = normalizeSemester(regData.semester);
        const searchSemester = normalizeSemester(semester);
        
        const matchesSemester = 
          registrationSemester === searchSemester ||
          regData.semester === semester || 
          regData.semesterId === semester || 
          regData.academicSemesterId === semester ||
          (typeof regData.semester === 'object' && regData.semester?.name === semester);
        
        if (!matchesYear || !matchesSemester) continue;
        
        // Check if the course is in the array (handle all possible formats)
        const courseCodeUpper = courseCode.toUpperCase().trim();
        const hasCourse = regData.courses.some(c => {
          if (typeof c === 'string') {
            return c.toUpperCase().trim() === courseCodeUpper;
          }
          
          // Try all possible field names for the course code with more flexible matching
          return (
            (c.courseCode && c.courseCode.toUpperCase().trim() === courseCodeUpper) ||
            (c.code && c.code.toUpperCase().trim() === courseCodeUpper) ||
            (c.courseId && c.courseId.toUpperCase().trim() === courseCodeUpper) ||
            (c.id && c.id.toUpperCase().trim() === courseCodeUpper) ||
            (c.title && c.title.toUpperCase().includes(courseCodeUpper)) ||
            (c.courseName && c.courseName.toUpperCase().includes(courseCodeUpper))
          );
        });
        
        if (!hasCourse) continue;
        
        // Get student info - first try students collection
        const studentId = regData.studentId;
        let studentData = null;
        
        if (studentId) {
          const studentDoc = await getDoc(doc(db, 'students', studentId));
          if (studentDoc.exists()) {
            studentData = studentDoc.data();
          }
        }
        
        // If we couldn't find in students collection, use registration data
        if (!studentData) {
          const programId = this.extractProgram(regData);
          const programName = await this.getProgramName(programId);
          
          students.push({
            id: studentId || docSnap.id,
            indexNumber: this.extractIndexNumber(regData),
            registrationNumber: this.extractIndexNumber(regData), // Frontend looks for this field
            firstName: this.extractFirstName(regData),
            lastName: this.extractLastName(regData),
            email: regData.email || 'N/A',
            level: regData.level || '100',
            department: programName,
            program: programName, // Frontend looks for this field
          });
        } else {
          const regNumber = studentData.registrationNumber || studentData.indexNumber || regData.registrationNumber || 'N/A';
          const programId = studentData.department || studentData.program || studentData.programme || regData.program || 'N/A';
          const programName = await this.getProgramName(programId);
          
          students.push({
            id: studentId,
            indexNumber: regNumber,
            registrationNumber: regNumber, // Frontend looks for this field
            firstName: this.extractFirstName(studentData),
            lastName: this.extractLastName(studentData),
            email: studentData.email || 'N/A',
            level: studentData.level || studentData.currentLevel || regData.level || '100',
            department: programName,
            program: programName, // Frontend looks for this field
          });
        }
      }
      
      console.log('Total students found for course:', students.length);
      return students;
    } catch (error) {
      console.error('Error getting all students for course:', error);
      return [];
    }
  },
  
  /**
   * Verify that a lecturer is assigned to teach a specific course
   * This is a security check to ensure data access is restricted appropriately
   */
  async verifyLecturerAssignment(
    lecturerId: string,
    courseCode: string, // now using courseCode
    academicYear: string,
    semester: string
  ): Promise<boolean> {
    try {
      console.log(`Verifying lecturer assignment for:
        - lecturerId: ${lecturerId}
        - courseCode: ${courseCode}
        - academicYear: ${academicYear}
        - semester: ${semester}`);
        
      const assignmentsRef = collection(db, 'lecturer-assignments');
      
      // STEP 1: First get all assignments for this lecturer
      const lecturerQuery = query(
        assignmentsRef,
        where('lecturerId', '==', lecturerId),
        where('status', '==', 'active')
      );
      
      const lecturerSnapshot = await getDocs(lecturerQuery);
      console.log('Total active assignments for lecturer:', lecturerSnapshot.size);
      
      if (lecturerSnapshot.size === 0) {
        console.log('No active assignments found for lecturer');
        return false;
      }
      
      // STEP 2: Check each assignment to see if it matches our criteria
      let matchFound = false;
      
      for (const doc of lecturerSnapshot.docs) {
        const assignment = doc.data();
        console.log('Checking assignment:', {
          courseId: assignment.courseId,
          courseCode: assignment.courseCode,
          academicYearId: assignment.academicYearId,
          academicSemesterId: assignment.academicSemesterId,
          academicYear: assignment.academicYear,
          semester: assignment.semester
        });
        
        // Get the course details to find the course code
        let assignmentCourseCode = assignment.courseCode;
        
        // If assignment doesn't have courseCode, try to get it from the course document
        if (!assignmentCourseCode && assignment.courseId) {
          try {
            const courseDoc = await getDoc(doc(db, 'academic-courses', assignment.courseId));
            if (courseDoc.exists()) {
              const courseData = courseDoc.data();
              assignmentCourseCode = courseData.code || courseData.title?.split(' - ')[0] || assignment.courseId;
              console.log('🔍 Found course code from course document:', assignmentCourseCode);
            }
          } catch (error) {
            console.log('❌ Error fetching course document:', error);
            assignmentCourseCode = assignment.courseId; // fallback
          }
        }
        
        // Also check if the courseId itself matches the courseCode (for cases where courseId is the code)
        const courseIdMatches = assignment.courseId === courseCode;
        
        // Check if this assignment matches our course (flexible matching)
        const courseMatches = 
          courseIdMatches ||
          assignmentCourseCode === courseCode ||
          assignment.courseId?.includes(courseCode) ||
          assignmentCourseCode?.includes(courseCode);
          
        if (courseMatches) {
          console.log('✅ Course match found!');
          console.log('   - Assignment courseId:', assignment.courseId);
          console.log('   - Assignment courseCode:', assignmentCourseCode);
          console.log('   - Searching for courseCode:', courseCode);
          console.log('   - CourseId matches:', courseIdMatches);
          matchFound = true;
        } else {
          console.log('❌ No course match');
          console.log('   - Assignment courseId:', assignment.courseId);
          console.log('   - Assignment courseCode:', assignmentCourseCode);
          console.log('   - Searching for courseCode:', courseCode);
        }
      }
      
      console.log('Final result - Assignment match found:', matchFound);
      return matchFound;
    } catch (error) {
      console.error('Error verifying lecturer assignment:', error);
      return false;
    }
  },
  
  /**
   * Check if a student is registered for a specific course
   */
  async checkStudentCourseRegistration(
    studentId: string,
    courseCode: string,
    academicYear: string,
    semester: string
  ): Promise<boolean> {
    try {
      console.log(`Checking if student ${studentId} is registered for course ${courseCode} in ${academicYear} ${semester}`);
      
      // Method 1: Check course-registrations collection (Academic Affairs system)
      try {
        const registrationsRef = collection(db, "course-registrations");
        
        // Try multiple queries to find the student registration
        const queries = [
          // Query by studentId (if it's a document ID)
          query(registrationsRef, where("studentId", "==", studentId)),
          // Query by email (if studentId is actually an email)
          query(registrationsRef, where("email", "==", studentId)),
          // Query by registrationNumber (if studentId is actually a registration number)
          query(registrationsRef, where("registrationNumber", "==", studentId))
        ];
        
        for (const queryRef of queries) {
          const registrationsSnapshot = await getDocs(queryRef);
          
          for (const doc of registrationsSnapshot.docs) {
            const regData = doc.data();
            
            // Check year and semester match
            const matchesYear = 
              regData.academicYear === academicYear || 
              regData.academicYearId === academicYear ||
              (typeof regData.academicYear === 'object' && regData.academicYear?.year === academicYear);
            
            const registrationSemester = normalizeSemester(regData.semester);
            const searchSemester = normalizeSemester(semester);
            
            const matchesSemester = 
              registrationSemester === searchSemester ||
              regData.semester === semester || 
              regData.semesterId === semester || 
              regData.academicSemesterId === semester ||
              (typeof regData.semester === 'object' && regData.semester?.name === semester);
            
            if (!matchesYear || !matchesSemester) continue;
            
            // Check if this registration contains our course
            if (regData.courses && Array.isArray(regData.courses)) {
              const courseCodeUpper = courseCode.toUpperCase().trim();
              const hasCourse = regData.courses.some(course => {
                if (typeof course === 'string') {
                  return course.toUpperCase().trim() === courseCodeUpper;
                }
                
                return (
                  (course.courseCode && course.courseCode.toUpperCase().trim() === courseCodeUpper) ||
                  (course.code && course.code.toUpperCase().trim() === courseCodeUpper) ||
                  (course.courseId && course.courseId.toUpperCase().trim() === courseCodeUpper) ||
                  (course.id && course.id.toUpperCase().trim() === courseCodeUpper) ||
                  (course.title && course.title.toUpperCase().includes(courseCodeUpper)) ||
                  (course.courseName && course.courseName.toUpperCase().includes(courseCodeUpper))
                );
              });
              
              if (hasCourse) {
                console.log(`✅ Found registration in course-registrations for ${courseCode}`);
                return true;
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error checking course-registrations:", error);
      }
      
      // Method 2: Check student-registrations collection (Student Portal system)
      try {
        const studentRegsRef = collection(db, "student-registrations");
        
        // Try multiple queries to find the student registration
        const queries = [
          // Query by studentId (if it's a document ID)
          query(studentRegsRef, where("studentId", "==", studentId)),
          // Query by email (if studentId is actually an email)
          query(studentRegsRef, where("email", "==", studentId)),
          // Query by registrationNumber (if studentId is actually a registration number)
          query(studentRegsRef, where("registrationNumber", "==", studentId))
        ];
        
        for (const queryRef of queries) {
          const studentRegsSnapshot = await getDocs(queryRef);
          
          for (const doc of studentRegsSnapshot.docs) {
            const regData = doc.data();
            
            // Check year and semester match
            const matchesYear = 
              regData.academicYear === academicYear || 
              regData.academicYearId === academicYear ||
              (typeof regData.academicYear === 'object' && regData.academicYear?.year === academicYear);
            
            const registrationSemester = normalizeSemester(regData.semester);
            const searchSemester = normalizeSemester(semester);
            
            const matchesSemester = 
              registrationSemester === searchSemester ||
              regData.semester === semester || 
              regData.semesterId === semester || 
              regData.academicSemesterId === semester ||
              (typeof regData.semester === 'object' && regData.semester?.name === semester);
            
            if (!matchesYear || !matchesSemester) continue;
            
            // Check if this registration contains our course
            if (regData.courses && Array.isArray(regData.courses)) {
              const courseCodeUpper = courseCode.toUpperCase().trim();
              const hasCourse = regData.courses.some(course => {
                if (typeof course === 'string') {
                  return course.toUpperCase().trim() === courseCodeUpper;
                }
                
                return (
                  (course.courseCode && course.courseCode.toUpperCase().trim() === courseCodeUpper) ||
                  (course.code && course.code.toUpperCase().trim() === courseCodeUpper) ||
                  (course.courseId && course.courseId.toUpperCase().trim() === courseCodeUpper) ||
                  (course.id && course.id.toUpperCase().trim() === courseCodeUpper) ||
                  (course.title && course.title.toUpperCase().includes(courseCodeUpper)) ||
                  (course.courseName && course.courseName.toUpperCase().includes(courseCodeUpper))
                );
              });
              
              if (hasCourse) {
                console.log(`✅ Found registration in student-registrations for ${courseCode}`);
                return true;
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error checking student-registrations:", error);
      }
      
      // Method 3: Check by email (for students who might be identified by email)
      try {
        // First get the student's email
        const studentDoc = await getDoc(doc(db, "users", studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const studentEmail = studentData.email?.toLowerCase();
          
          if (studentEmail) {
            const emailRegsRef = collection(db, "course-registrations");
            const emailRegsQuery = query(
              emailRegsRef,
              where("email", "==", studentEmail),
              where("academicYear", "==", academicYear),
              where("semester", "==", semester)
            );
            
            const emailRegsSnapshot = await getDocs(emailRegsQuery);
            
            for (const doc of emailRegsSnapshot.docs) {
              const regData = doc.data();
              
              if (regData.courses && Array.isArray(regData.courses)) {
                const hasCourse = regData.courses.some(course => 
                  (typeof course === 'object' && (
                    course.courseCode === courseCode || 
                    course.code === courseCode ||
                    course.courseName === courseCode
                  ))
                );
                
                if (hasCourse) {
                  console.log(`✅ Found registration by email for ${courseCode}`);
                  return true;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error checking by email:", error);
      }
      
      console.log(`❌ No registration found for student ${studentId} in course ${courseCode}`);
      return false;
    } catch (error) {
      console.error("Error checking student course registration:", error);
      return false;
    }
  },
  
  /**
   * Extract first name from student data using various possible field structures
   */
  extractFirstName(data: any): string {
    console.log('🔍 Extracting firstName from:', {
      studentName: data.studentName,
      firstName: data.firstName,
      otherNames: data.otherNames,
      surname: data.surname,
      name: data.name
    });
    
    // Try studentName first (from course registrations)
    if (data.studentName) {
      const nameParts = data.studentName.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      console.log('✅ Using studentName:', firstName);
      return firstName;
    }
    
    // Try firstName field
    if (data.firstName) {
      console.log('✅ Using firstName:', data.firstName);
      return data.firstName;
    }
    
    // Try otherNames (common in student records) - this is typically first name
    if (data.otherNames) {
      console.log('✅ Using otherNames as firstName:', data.otherNames);
      return data.otherNames;
    }
    
    // Try name field
    if (data.name) {
      const firstName = data.name.split(' ')[0] || 'Unknown';
      console.log('✅ Using name:', firstName);
      return firstName;
    }
    
    // Try fullName
    if (data.fullName) {
      const firstName = data.fullName.split(' ')[0] || 'Unknown';
      console.log('✅ Using fullName:', firstName);
      return firstName;
    }
    
    console.log('❌ No name found, using Unknown');
    return 'Unknown';
  },
  
  /**
   * Extract last name from student data using various possible field structures
   */
    extractLastName(data: any): string {
    console.log('🔍 Extracting lastName from:', {
      studentName: data.studentName,
      lastName: data.lastName,
      surname: data.surname,
      name: data.name
    });
    
    // Try studentName first (from course registrations)
    if (data.studentName) {
      const nameParts = data.studentName.split(' ');
      const lastName = nameParts.slice(1).join(' ') || 'Student';
      console.log('✅ Using studentName for lastName:', lastName);
      return lastName;
    }
    
    // Try surname field (common in student records) - this is typically last name
    if (data.surname) {
      console.log('✅ Using surname as lastName:', data.surname);
      return data.surname;
    }
    
    // Try lastName field
    if (data.lastName) {
      console.log('✅ Using lastName:', data.lastName);
      return data.lastName;
    }
    
    // Try name field
    if (data.name) {
      const lastName = data.name.split(' ').slice(1).join(' ') || 'Student';
      console.log('✅ Using name for lastName:', lastName);
      return lastName;
    }
    
    // Try fullName
    if (data.fullName) {
      const lastName = data.fullName.split(' ').slice(1).join(' ') || 'Student';
      console.log('✅ Using fullName for lastName:', lastName);
      return lastName;
    }
    
    console.log('❌ No lastName found, using Student');
    return 'Student';
  },

  /**
   * Extract program name from various possible field formats
   */
  extractProgram(data: any): string {
    console.log('🎓 Extracting program from:', {
      program: data.program,
      programme: data.programme,
      programName: data.programName,
      department: data.department,
      allFields: Object.keys(data)
    });
    
    // Try program field first
    if (data.program && typeof data.program === 'string' && data.program !== '') {
      console.log('✅ Using program:', data.program);
      return data.program;
    }
    
    // Try programme field (common spelling)
    if (data.programme && typeof data.programme === 'string' && data.programme !== '') {
      console.log('✅ Using programme:', data.programme);
      return data.programme;
    }
    
    // Try programName
    if (data.programName && data.programName !== '') {
      console.log('✅ Using programName:', data.programName);
      return data.programName;
    }
    
    // Try department
    if (data.department && data.department !== '') {
      console.log('✅ Using department:', data.department);
      return data.department;
    }
    
    console.log('❌ No program found, using N/A');
    return 'N/A';
  },

  /**
   * Extract index number from various possible field formats
   */
  extractIndexNumber(data: any): string {
    console.log('🔢 Extracting indexNumber from:', {
      registrationNumber: data.registrationNumber,
      indexNumber: data.indexNumber,
      studentIndexNumber: data.studentIndexNumber,
      allFields: Object.keys(data)
    });
    
    // First priority: registrationNumber (this is what we want to show as Index Number)
    if (data.registrationNumber && data.registrationNumber !== '') {
      console.log('✅ Using registrationNumber as Index Number:', data.registrationNumber);
      return data.registrationNumber;
    }
    
    // Try indexNumber field
    if (data.indexNumber && data.indexNumber !== '') {
      console.log('✅ Using indexNumber:', data.indexNumber);
      return data.indexNumber;
    }
    
    // Try studentIndexNumber
    if (data.studentIndexNumber && data.studentIndexNumber !== '') {
      console.log('✅ Using studentIndexNumber:', data.studentIndexNumber);
      return data.studentIndexNumber;
    }
    
    console.log('❌ No index number found, using N/A');
    return 'N/A';
  },

  /**
   * Get program name from program ID
   */
  async getProgramName(programId: string): Promise<string> {
    try {
      if (!programId || programId === 'N/A') return 'N/A';
      
      console.log('🔍 Looking up program for ID:', programId);
      
      // Check if it's already a program name (contains spaces or dots)
      if (programId.includes(' ') || programId.includes('.')) {
        console.log('✅ Already a program name:', programId);
        return programId;
      }
      
      // Create a mapping for known invalid/orphaned program IDs
      const programMappings: { [key: string]: string } = {
        '8FFH2FkxK18Rd9ONr6RJ': 'B.Sc. Environmental Science and Management',
        'jxb21hkh0oeiWKp2V8GD': 'B.Sc. Environmental Science and Management',
        // Add more mappings as needed
      };
      
      // Check if we have a mapping for this ID
      if (programMappings[programId]) {
        console.log('✅ Using mapping for program ID:', programMappings[programId]);
        return programMappings[programId];
      }
      
      // Look up program by ID in database
      const programDoc = await getDoc(doc(db, 'programs', programId));
      if (programDoc.exists()) {
        const programData = programDoc.data();
        const programName = `B.Sc. ${programData.name}` || programData.title || programData.programName || programId;
        console.log('✅ Found in database:', programName);
        return programName;
      }
      
      // If not found anywhere, return a default based on pattern
      console.log('❌ Program not found, using default');
      return 'B.Sc. Environmental Science and Management'; // Default for this university
    } catch (error) {
      console.error('Error getting program name:', error);
      return 'B.Sc. Environmental Science and Management'; // Safe default
    }
  },

  /**
   * Submit grades to Academic Affairs for director approval
   */
  async submitGrades(grades: any[]): Promise<boolean> {
    try {
      console.log('📤 Submitting grades to Academic Affairs:', grades);
      console.log('📊 First grade object structure:', grades[0]);
      
      // Validate that all students are registered for the course
      const courseCode = grades[0]?.courseCode || 'unknown';
      const academicYear = grades[0]?.academicYear || '2025-2026';
      const semester = grades[0]?.semester || '1';
      
      console.log('🔍 Validating course registrations for:', { courseCode, academicYear, semester });
      
      const unregisteredStudents: string[] = [];
      
      for (const grade of grades) {
        const studentId = grade.studentId || 'unknown';
        const isRegistered = await this.checkStudentCourseRegistration(
          studentId,
          courseCode,
          academicYear,
          semester
        );
        
        if (!isRegistered) {
          unregisteredStudents.push(grade.studentName || studentId);
          console.log(`❌ Student ${grade.studentName || studentId} is not registered for ${courseCode}`);
        }
      }
      
      if (unregisteredStudents.length > 0) {
        console.error('❌ Cannot submit grades - unregistered students:', unregisteredStudents);
        throw new Error(`Cannot submit grades. The following students are not registered for ${courseCode}: ${unregisteredStudents.join(', ')}. Please ensure all students are properly registered for this course before submitting grades.`);
      }
      
      console.log('✅ All students are registered for the course');
      
      // Create grade submission document with safe field access
      const gradeSubmission = {
        submissionId: `grades_${Date.now()}`,
        submittedBy: grades[0]?.lecturerId || 'unknown',
        courseId: grades[0]?.courseId || 'unknown',
        courseCode: grades[0]?.courseCode || 'unknown',
        courseName: grades[0]?.courseName || grades[0]?.courseCode || 'Unknown Course',
        academicYear: grades[0]?.academicYear || '2025-2026',
        semester: grades[0]?.semester || '1',
        submissionDate: Timestamp.now(),
        status: 'pending_approval',
        approvedBy: '',
        approvedDate: null,
        grades: grades.map(grade => {
          const gradeObj = {
            studentId: grade.studentId || 'unknown',
            studentName: grade.studentName || 'Unknown Student',
            registrationNumber: grade.registrationNumber || 'N/A',
            assessment: Number(grade.assessment) || 0,
            midsem: Number(grade.midsem) || 0,
            exams: Number(grade.exams) || 0,
            total: Number(grade.total) || 0,
            grade: grade.grade || 'F',
            submittedAt: Timestamp.now()
          };
          console.log('🎓 Processed grade object:', gradeObj);
          return gradeObj;
        }),
        totalStudents: grades.length,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('📋 Final submission object:', gradeSubmission);
      
      // Submit to grade-submissions collection for Academic Affairs review
      const gradeSubmissionsRef = collection(db, 'grade-submissions');
      const docRef = await addDoc(gradeSubmissionsRef, gradeSubmission);
      
      console.log('✅ Grades submitted successfully with ID:', docRef.id);
      
      // Also update individual student grade records
      for (const grade of grades) {
        try {
          const studentGradeRef = collection(db, 'student-grades');
          await addDoc(studentGradeRef, {
            studentId: grade.studentId || 'unknown',
            courseId: grade.courseId || 'unknown',
            courseCode: grade.courseCode || 'unknown',
            courseName: grade.courseName || grade.courseCode || 'Unknown Course',
            lecturerId: grade.lecturerId || 'unknown',
            academicYear: grade.academicYear || '2025-2026',
            semester: grade.semester || '1',
            assessment: Number(grade.assessment) || 0,
            midsem: Number(grade.midsem) || 0,
            exams: Number(grade.exams) || 0,
            total: Number(grade.total) || 0,
            grade: grade.grade || 'F',
            status: 'pending_approval',
            submissionId: docRef.id,
            submittedAt: Timestamp.now(),
            createdAt: Timestamp.now()
          });
        } catch (error) {
          console.error('Error saving individual student grade:', error);
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Error submitting grades:', error);
      return false;
    }
  },

  /**
   * Get student by registration number
   */
  async getStudentByRegistrationNumber(
    registrationNumber: string
  ): Promise<Student | null> {
    try {
      const studentRef = collection(db, "students");
      const studentQuery = query(studentRef, where("registrationNumber", "==", registrationNumber));
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const studentData = studentSnapshot.docs[0].data();
        const studentId = studentSnapshot.docs[0].id;
        
        return {
          id: studentId,
          indexNumber: studentData.registrationNumber || studentData.indexNumber || "N/A",
          firstName: this.extractFirstName(studentData),
          lastName: this.extractLastName(studentData),
          email: studentData.email || "N/A",
          level: studentData.level || studentData.currentLevel || "100",
          department: studentData.department || studentData.program || studentData.programme || "N/A"
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting student by registration number:", error);
      return null;
    }
  },

  /**
   * Search student by registration number for a specific course and lecturer
   * This is the missing function that was causing the error
   */
     async searchStudentByRegistrationNumber(
     registrationNumber: string,
     courseCode: string,
     lecturerId: string
   ): Promise<Student[]> {
     try {
       console.log("🔍 [StudentService] Starting search with parameters:", {
         registrationNumber,
         courseCode,
         lecturerId
       });

             // Validate inputs to prevent Firebase errors
       if (!registrationNumber || !courseCode || !lecturerId) {
         console.error("❌ [StudentService] Missing required parameters for search");
         return [];
       }
       
       console.log("✅ [StudentService] All parameters validated");

      // STEP 1: Search in course-registrations collection (primary source)
      console.log("📚 Searching in course-registrations collection...");
      const courseRegsRef = collection(db, "course-registrations");
      const courseRegQuery = query(
        courseRegsRef,
        where("registrationNumber", "==", registrationNumber)
      );
      
      const courseRegSnapshot = await getDocs(courseRegQuery);
      console.log(`Found ${courseRegSnapshot.size} course registrations for student`);

      for (const courseRegDoc of courseRegSnapshot.docs) {
        const regData = courseRegDoc.data();
        console.log("📋 Checking course registration:", regData);

        // Check if the student is registered for this specific course
        const isRegisteredForCourse = regData.courses?.some((course: any) => {
          const courseMatch = 
            course.courseCode === courseCode ||
            course.code === courseCode ||
            course.courseId === courseCode;
          
          console.log(`🎯 Course match check: ${course.courseCode || course.code} === ${courseCode} → ${courseMatch}`);
          return courseMatch;
        });

        if (isRegisteredForCourse) {
          console.log("✅ Student is registered for this course!");
          
          // Create student object from registration data
          const regNumber = this.extractIndexNumber(regData) !== 'N/A' ? this.extractIndexNumber(regData) : registrationNumber;
          const programId = this.extractProgram(regData);
          const programName = await this.getProgramName(programId);
          
          const student: Student = {
            id: regData.studentId || courseRegDoc.id,
            indexNumber: regNumber,
            registrationNumber: regNumber, // Frontend looks for this field
            firstName: this.extractFirstName(regData),
            lastName: this.extractLastName(regData),
            email: regData.email || "N/A",
            level: regData.level || "100",
            department: programName,
            program: programName // Frontend looks for this field
          };

          console.log("👤 Found student:", student);
          return [student];
        }
      }

      // STEP 2: Fallback - search in students collection
      console.log("🔄 Trying fallback search in students collection...");
      const studentsRef = collection(db, "students");
      const studentQuery = query(
        studentsRef,
        where("registrationNumber", "==", registrationNumber)
      );
      
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const studentData = studentSnapshot.docs[0].data();
        console.log("👤 Found student in students collection:", studentData);
        
        // Check if this student has any course registrations for the given course
        const hasThisCourse = await this.checkStudentHasCourse(
          studentSnapshot.docs[0].id,
          courseCode
        );
        
        if (hasThisCourse) {
          const student: Student = {
            id: studentSnapshot.docs[0].id,
            indexNumber: registrationNumber,
            firstName: this.extractFirstName(studentData),
            lastName: this.extractLastName(studentData),
            email: studentData.email || "N/A",
            level: studentData.level || studentData.currentLevel || "100",
            department: studentData.department || studentData.program || studentData.programme || "N/A"
          };

          return [student];
        }
      }

      console.log("❌ No student found for the given registration number and course");
      return [];

    } catch (error) {
      console.error("❌ Error in searchStudentByRegistrationNumber:", error);
      return [];
    }
  },

  /**
   * Helper function to check if a student has a specific course
   */
  async checkStudentHasCourse(studentId: string, courseCode: string): Promise<boolean> {
    try {
      // Check course-registrations collection
      const courseRegsRef = collection(db, "course-registrations");
      const regQuery = query(
        courseRegsRef,
        where("studentId", "==", studentId)
      );
      
      const regSnapshot = await getDocs(regQuery);
      
      for (const regDoc of regSnapshot.docs) {
        const regData = regDoc.data();
        const hasCourse = regData.courses?.some((course: any) => 
          course.courseCode === courseCode ||
          course.code === courseCode ||
          course.courseId === courseCode
        );
        
        if (hasCourse) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking if student has course:", error);
      return false;
    }
  }
}; 