"use client"

import { db } from './firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  Timestamp, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore"
import { Student } from './auth'

export interface AcademicLevel {
  level: string;
  levelNumber: number; // 100, 200, etc.
  creditsRequired: number;
  creditsEarned: number;
  gpa: number;
  status: 'completed' | 'in-progress' | 'upcoming';
  academicYear: string;
}

export interface AcademicRecord {
  studentId: string;
  registrationNumber: string;
  indexNumber: string;
  programme: string;
  programmeDuration: number; // In years
  currentLevel: string;
  currentLevelNumber: number;
  yearOfAdmission: string;
  expectedCompletionYear: string;
  entryQualification: string;
  entryLevel: string;
  currentCGPA: number;
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  creditsRemaining: number;
  academicStanding: string;
  projectedClassification: string;
  probationStatus: string;
  graduationEligibility: string;
  levels: AcademicLevel[];
}

export async function getAcademicRecord(student: Student): Promise<AcademicRecord> {
  try {
    // Check if we have an academic record document for this student
    const academicRecordsRef = collection(db, 'academic-records');
    const q = query(academicRecordsRef, where('studentId', '==', student.id));
    const querySnapshot = await getDocs(q);
    
    // If we have an academic record document, use that data
    if (!querySnapshot.empty) {
      const academicDoc = querySnapshot.docs[0];
      const academicData = academicDoc.data();
      
      return {
        studentId: student.id,
        registrationNumber: student.registrationNumber || '',
        indexNumber: student.studentIndexNumber || '',
        programme: academicData.programme || student.programme || '',
        programmeDuration: academicData.programmeDuration || 4,
        currentLevel: academicData.currentLevel || student.currentLevel || '',
        currentLevelNumber: academicData.currentLevelNumber || 
          parseInt(student.currentLevel?.replace(/\D/g, '') || '0') || 100,
        yearOfAdmission: academicData.yearOfAdmission || student.yearOfEntry || '',
        expectedCompletionYear: academicData.expectedCompletionYear || 
          calculateExpectedCompletionYear(student.yearOfEntry, academicData.programmeDuration || 4),
        entryQualification: academicData.entryQualification || student.entryQualification || '',
        entryLevel: academicData.entryLevel || student.entryLevel || '',
        currentCGPA: academicData.currentCGPA || 0,
        totalCreditsEarned: academicData.totalCreditsEarned || 0,
        totalCreditsRequired: academicData.totalCreditsRequired || 144,
        creditsRemaining: academicData.creditsRemaining || 
          (academicData.totalCreditsRequired || 144) - (academicData.totalCreditsEarned || 0),
        academicStanding: academicData.academicStanding || 'Good Standing',
        projectedClassification: academicData.projectedClassification || 
          getProjectedClassification(academicData.currentCGPA || 0),
        probationStatus: academicData.probationStatus || 'None',
        graduationEligibility: academicData.graduationEligibility || 'On Track',
        levels: academicData.levels || generateDefaultLevels(
          parseInt(student.currentLevel?.replace(/\D/g, '') || '0') || 100,
          student.yearOfEntry || '',
          academicData.programmeDuration || 4
        )
      };
    } 
    // Otherwise, generate a record based on student information
    else {
      // Get the current level number (100, 200, etc)
      const currentLevelNumber = parseInt(student.currentLevel?.replace(/\D/g, '') || '0') || 100;
      const entryYear = student.yearOfEntry || '';
      const programmeDuration = 4; // Default to 4 years
      
      // Generate academic record based on student information
      return {
        studentId: student.id,
        registrationNumber: student.registrationNumber || '',
        indexNumber: student.studentIndexNumber || '',
        programme: student.programme || '',
        programmeDuration,
        currentLevel: student.currentLevel || `Level ${currentLevelNumber}`,
        currentLevelNumber,
        yearOfAdmission: entryYear,
        expectedCompletionYear: calculateExpectedCompletionYear(entryYear, programmeDuration),
        entryQualification: student.entryQualification || '',
        entryLevel: student.entryLevel || 'Level 100',
        currentCGPA: 0,
        totalCreditsEarned: 0,
        totalCreditsRequired: 144,
        creditsRemaining: 144,
        academicStanding: 'Good Standing',
        projectedClassification: 'Not Available',
        probationStatus: 'None',
        graduationEligibility: 'On Track',
        levels: generateDefaultLevels(currentLevelNumber, entryYear, programmeDuration)
      };
    }
  } catch (error) {
    console.error('Error fetching academic record:', error);
    throw new Error('Failed to fetch academic record');
  }
}

export async function getStudentCourseRegistration(studentId: string, academicYear?: string, semester?: string) {
  try {
    if (!studentId) {
      console.error("No student ID provided to getStudentCourseRegistration");
      return null;
    }
    
    console.log(`Fetching registration for student ${studentId} (Year: ${academicYear || 'any'}, Semester: ${semester || 'any'})`);
    
    // Get current student info first so we have all possible identifiers
    let studentInfo: any = null;
    let regNumber = null;
    let studentEmail = null;
    let studentName = null;
    
    try {
      // Try to get student info from users collection
      const userDoc = await getDoc(doc(db, "users", studentId));
      if (userDoc.exists()) {
        studentInfo = userDoc.data();
        regNumber = studentInfo.registrationNumber;
        studentEmail = studentInfo.email?.toLowerCase();
        studentName = `${studentInfo.surname || ''} ${studentInfo.otherNames || ''}`.trim();
        console.log(`Found student in users collection: ${studentName}, Registration: ${regNumber}, Email: ${studentEmail}`);
      }
      
      // If no info from users, try student-registrations
      if (!studentInfo) {
        const regDoc = await getDoc(doc(db, "student-registrations", studentId));
        if (regDoc.exists()) {
          studentInfo = regDoc.data();
          regNumber = studentInfo.registrationNumber;
          studentEmail = studentInfo.email?.toLowerCase();
          studentName = `${studentInfo.surname || ''} ${studentInfo.otherNames || ''}`.trim();
          console.log(`Found student in student-registrations: ${studentName}, Registration: ${regNumber}, Email: ${studentEmail}`);
        }
      }
      
      // If still no info, try students collection
      if (!studentInfo) {
        const studentDoc = await getDoc(doc(db, "students", studentId));
        if (studentDoc.exists()) {
          studentInfo = studentDoc.data();
          regNumber = studentInfo.registrationNumber;
          studentEmail = studentInfo.email?.toLowerCase();
          studentName = studentInfo.name || `${studentInfo.surname || ''} ${studentInfo.otherNames || ''}`.trim();
          console.log(`Found student in students collection: ${studentName}, Registration: ${regNumber}, Email: ${studentEmail}`);
        }
      }
    } catch (error) {
      console.error("Error getting student info:", error);
    }
    
    // Now try all possible ways to find course registrations
    let results: any[] = [];
    
    // Method 1: Try by studentId
    console.log(`Method 1: Looking up registration by studentId: ${studentId}`);
    let q = query(collection(db, "course-registrations"), where("studentId", "==", studentId));
    if (academicYear) q = query(q, where("academicYear", "==", academicYear));
    if (semester) q = query(q, where("semester", "==", semester));
    let snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`Found ${snapshot.docs.length} registrations by studentId`);
      results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    // Method 2: Try by email
    if (results.length === 0 && studentEmail) {
      console.log(`Method 2: Looking up registration by email: ${studentEmail}`);
      q = query(collection(db, "course-registrations"), where("email", "==", studentEmail));
      if (academicYear) q = query(q, where("academicYear", "==", academicYear));
      if (semester) q = query(q, where("semester", "==", semester));
      snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`Found ${snapshot.docs.length} registrations by email`);
        results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }
    
    // Method 3: Try by registration number
    if (results.length === 0 && regNumber) {
      console.log(`Method 3: Looking up registration by registrationNumber: ${regNumber}`);
      q = query(collection(db, "course-registrations"), where("registrationNumber", "==", regNumber));
      if (academicYear) q = query(q, where("academicYear", "==", academicYear));
      if (semester) q = query(q, where("semester", "==", semester));
      snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`Found ${snapshot.docs.length} registrations by registrationNumber`);
        results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }
    
    // Method 4: Try by student name
    if (results.length === 0 && studentName) {
      console.log(`Method 4: Looking up registration by studentName: ${studentName}`);
      q = query(collection(db, "course-registrations"), where("studentName", "==", studentName));
      if (academicYear) q = query(q, where("academicYear", "==", academicYear));
      if (semester) q = query(q, where("semester", "==", semester));
      snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`Found ${snapshot.docs.length} registrations by studentName`);
        results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }
    
    // Method 5: Last resort, get all registrations and filter client-side
    if (results.length === 0 && (studentEmail || regNumber || studentName)) {
      console.log("Method 5: Trying manual case-insensitive matching...");
      const allRegistrationsRef = collection(db, "course-registrations");
      const allRegistrationsSnapshot = await getDocs(allRegistrationsRef);
      
      // Manually filter registrations by known student attributes
      const matchingRegs = allRegistrationsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return (
          (studentEmail && data.email && data.email.toLowerCase() === studentEmail.toLowerCase()) ||
          (regNumber && data.registrationNumber && data.registrationNumber === regNumber) ||
          (studentName && data.studentName && data.studentName.toLowerCase().includes(studentName.toLowerCase()))
        );
      });
      
      if (matchingRegs.length > 0) {
        console.log(`Found ${matchingRegs.length} registrations through manual matching`);
        results = matchingRegs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }
    
    if (results.length === 0) {
      console.log("No registrations found after trying all methods");
      return null;
    }
    
    console.log(`Found ${results.length} total registrations for student`);
    
    // Sort by registration date (newest first)
    results.sort((a, b) => {
      const dateA = a.registrationDate?.toDate?.() || new Date(0);
      const dateB = b.registrationDate?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log("Returning most recent registration:", results[0]);
    return results[0];
  } catch (error) {
    console.error("Error getting student course registration:", error);
    return null;
  }
}

// Helper function to calculate expected completion year
function calculateExpectedCompletionYear(startYear: string | undefined, duration: number): string {
  if (!startYear) return '';
  
  const year = parseInt(startYear);
  if (isNaN(year)) return '';
  
  return (year + duration).toString();
}

// Helper function to get projected classification based on CGPA
function getProjectedClassification(cgpa: number): string {
  if (cgpa >= 3.6) return 'First Class';
  if (cgpa >= 3.0) return 'Second Class Upper';
  if (cgpa >= 2.5) return 'Second Class Lower';
  if (cgpa >= 2.0) return 'Third Class';
  if (cgpa >= 1.0) return 'Pass';
  return 'Not Available';
}

// Student self-registration functions

// Helper function to get program ID from program name
export async function getProgramIdFromName(programName: string): Promise<string | null> {
  try {
    console.log(`Looking for program ID for: ${programName}`);
    
    // Normalize program name for comparison
    const normalizeProgramName = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[.\s]/g, '') // Remove dots and spaces
        .replace(/bachelorofscience/g, 'bsc') // Handle "Bachelor of Science" variations
        .replace(/bachelorof/g, 'bsc') // Handle "Bachelor of" variations
        .trim();
    };
    
    const normalizedSearchName = normalizeProgramName(programName);
    console.log(`Normalized search name: "${normalizedSearchName}"`);
    
    const programsRef = collection(db, "academic-programs");
    const programQuery = query(programsRef, where("name", "==", programName), limit(1));
    const programSnapshot = await getDocs(programQuery);
    
    if (!programSnapshot.empty) {
      const programId = programSnapshot.docs[0].id;
      console.log(`Found program ID (exact match): ${programId} for program: ${programName}`);
      return programId;
    }
    
    // Try case-insensitive search
    const allProgramsSnapshot = await getDocs(programsRef);
    for (const doc of allProgramsSnapshot.docs) {
      const data = doc.data();
      if (data.name) {
        const normalizedDbName = normalizeProgramName(data.name);
        console.log(`Comparing: "${normalizedSearchName}" vs "${normalizedDbName}"`);
        
        if (normalizedDbName === normalizedSearchName) {
          console.log(`Found program ID (normalized match): ${doc.id} for program: ${programName}`);
          return doc.id;
        }
      }
    }
    
    // Try partial matching as last resort
    console.log('Trying partial matching...');
    for (const doc of allProgramsSnapshot.docs) {
      const data = doc.data();
      if (data.name) {
        const normalizedDbName = normalizeProgramName(data.name);
        if (normalizedDbName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedDbName)) {
          console.log(`Found program ID (partial match): ${doc.id} for program: ${programName}`);
          return doc.id;
        }
      }
    }
    
    console.log(`No program found for: ${programName}`);
    return null;
  } catch (error) {
    console.error("Error getting program ID:", error);
    return null;
  }
}

// Helper function to convert level text to number
function convertLevelToNumber(levelText: string): number {
  if (typeof levelText === 'number') return levelText;
  
  const match = levelText.toString().match(/\d+/);
  if (match) {
    return parseInt(match[0]);
  }
  
  // Default fallback
  return 100;
}

export async function getAvailableCoursesForStudent(
  studentId: string,
  programId: string,
  level: number,
  semester: number,
  academicYear: string
): Promise<any[]> {
  try {
    console.log(`Getting available courses for student: ${studentId}`);
    console.log(`Parameters: programId=${programId}, level=${level}, semester=${semester}, academicYear=${academicYear}`);
    
    // If programId is not provided, try to get it from the student's program name
    if (!programId) {
      console.log('No programId provided, attempting to get student data to find program...');
      
      // Get student data to find their program
      const studentRef = doc(db, "student-registrations", studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        const programName = studentData.programme;
        
        if (programName) {
          console.log(`Student program: ${programName}`);
          programId = await getProgramIdFromName(programName) || '';
          console.log(`Resolved program ID: ${programId}`);
        }
      }
    }
    
    if (!programId) {
      console.log('❌ No program ID available, cannot load courses');
      return [];
    }
    
    // Get program structure
    const programDoc = await getDoc(doc(db, "academic-programs", programId));
    if (!programDoc.exists()) {
      console.log(`❌ Program not found: ${programId}`);
      return [];
    }
    
    const programData = programDoc.data();
    const coursesPerLevel = programData.coursesPerLevel || {};
    
    console.log(`✅ Program found: ${programData.name}`);
    console.log(`Available levels:`, Object.keys(coursesPerLevel));
    
    // Get courses for this level and semester with multiple key formats supported
    const levelKey = level.toString();
    const possibleSemesterKeys: string[] = [
      semester.toString(),
      semester === 1 ? 'First Semester' : semester === 2 ? 'Second Semester' : semester.toString(),
      semester === 3 ? 'Third Trimester' : ''
    ].filter(Boolean) as string[];

    if (!coursesPerLevel[levelKey]) {
      console.log(`❌ No course structure found for Level ${levelKey}`);
      return [];
    }

    const availableSemesterKey = possibleSemesterKeys.find(key => coursesPerLevel[levelKey][key]);
    if (!availableSemesterKey) {
      console.log(`❌ No semester mapping found for keys ${JSON.stringify(possibleSemesterKeys)} at level ${levelKey}`);
      return [];
    }

    const semesterData = coursesPerLevel[levelKey][availableSemesterKey];
    console.log(`✅ Semester data found for key "${availableSemesterKey}":`, semesterData);

    // Collect course codes from the mapping. Prefer explicit academicYear, then 'all', otherwise merge all years.
    const collectedCodes = new Set<string>();
    const collectFromModeMap = (modeMap: any) => {
      if (!modeMap) return;
      if (Array.isArray(modeMap)) {
        modeMap.forEach((c: string) => collectedCodes.add(c));
        return;
      }
      Object.values(modeMap).forEach((arr: any) => {
        if (Array.isArray(arr)) {
          arr.forEach((c: string) => collectedCodes.add(c));
        }
      });
    };

    if (semesterData.all) {
      collectFromModeMap(semesterData.all);
    }
    if (academicYear && semesterData[academicYear]) {
      collectFromModeMap(semesterData[academicYear]);
    }
    if (collectedCodes.size === 0) {
      Object.keys(semesterData || {}).forEach((yearKey) => {
        if (yearKey === 'all') return;
        collectFromModeMap(semesterData[yearKey]);
      });
    }

    const courseCodes = Array.from(collectedCodes);
    console.log(`Found ${courseCodes.length} course codes after normalization:`, courseCodes);

    if (courseCodes.length === 0) {
      console.log(`❌ No course codes resolved for Level ${levelKey}, Semester ${availableSemesterKey}`);
      return [];
    }

    // Fetch courses in batches of 10 for Firestore 'in' query limitation
    const allCourses: any[] = [];
    for (let i = 0; i < courseCodes.length; i += 10) {
      const batch = courseCodes.slice(i, i + 10);
      const q = query(
        collection(db, "academic-courses"),
        where("code", "in", batch)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(docSnap => allCourses.push({ id: docSnap.id, ...docSnap.data() }));
    }

    // Deduplicate by code
    const seen = new Set<string>();
    const availableCourses = allCourses.filter((c: any) => {
      const code = c.code as string | undefined;
      if (!code) return true;
      if (seen.has(code)) return false;
      seen.add(code);
      return true;
    });

    console.log(`Retrieved ${availableCourses.length} courses from database after batching`);

    // Remove courses already registered by the student this semester
    const existingReg = await getStudentCourseRegistration(studentId, academicYear, semester.toString());
    const registeredCourseIds = existingReg?.courses?.map((c: any) => c.id || c.courseId) || [];
    const notAlreadyRegistered = availableCourses.filter((course: any) => !registeredCourseIds.includes(course.id));
    console.log(`After removing already-registered courses: ${notAlreadyRegistered.length}`);
    return notAlreadyRegistered;
  } catch (error) {
    console.error("Error getting available courses:", error);
    return [];
  }
}

export async function registerStudentForCourses(
  studentId: string,
  courses: any[],
  academicYear: string,
  semester: number | string,
  registrationType: 'student' | 'director' = 'student'
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  try {
    console.log(`Registering student ${studentId} for ${courses.length} courses`);

    // Normalize semester to number
    let semesterNumber: number = typeof semester === 'number' ? semester : 1;
    if (typeof semester === 'string') {
      const s = semester.trim();
      if (s === '1' || /first/i.test(s)) semesterNumber = 1;
      else if (s === '2' || /second/i.test(s)) semesterNumber = 2;
    }

    // Load student data from Firestore
    let studentDocSnap = await getDoc(doc(db, 'student-registrations', studentId));
    if (!studentDocSnap.exists()) {
      studentDocSnap = await getDoc(doc(db, 'students', studentId));
    }
    if (!studentDocSnap.exists()) {
      return { success: false, error: 'Student not found' };
    }
    const studentData = studentDocSnap.data() as any;

    // Build minimal Student object for academic record helper
    const studentObj: Student = {
      id: studentId,
      surname: studentData.surname || '',
      otherNames: studentData.otherNames || '',
      email: studentData.email || '',
      dateOfBirth: studentData.dateOfBirth || '',
      registrationNumber: studentData.registrationNumber,
      studentIndexNumber: studentData.studentIndexNumber,
      programme: studentData.programme,
      currentLevel: studentData.currentLevel,
      status: studentData.status,
      profilePictureUrl: studentData.profilePictureUrl,
    };

    const studentInfo = await getAcademicRecord(studentObj);

    // Resolve programId
    let programId: string = studentData.programId || '';
    if (!programId && studentData.programme) {
      const { getProgramIdFromName } = await import('@/lib/academic-service');
      programId = (await getProgramIdFromName(studentData.programme)) || '';
    }

    const levelNumber = parseInt((studentData.currentLevel || '').replace(/\D/g, '')) || studentInfo.currentLevelNumber || 100;

    // Validate course availability
    const availableCourses = await getAvailableCoursesForStudent(
      studentId,
      programId,
      levelNumber,
      semesterNumber,
      academicYear
    );

    const availableCourseIds = availableCourses.map((c: any) => c.id);
    const invalidCourses = courses.filter(course => !availableCourseIds.includes(course.id));
    if (invalidCourses.length > 0) {
      return { success: false, error: 'Some courses are not available for registration' };
    }

    // Create registration document
    const registrationData = {
      studentId,
      studentName: `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim(),
      registrationNumber: studentInfo.registrationNumber,
      email: studentData.email,
      programId,
      program: programId,
      programName: studentData.programme || studentInfo.programme,
      level: studentInfo.currentLevel || `Level ${levelNumber}`,
      semester: semesterNumber,
      academicYear,
      courses: courses.map((course: any) => ({
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.title,
      })),
      totalCredits: courses.reduce((sum: number, course: any) => sum + (course.credits || 0), 0),
      registrationDate: new Date(),
      registrationType,
      status: 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const registrationRef = await addDoc(collection(db, 'course-registrations'), registrationData);
    console.log(`Successfully registered student for ${courses.length} courses`);
    return { success: true, registrationId: registrationRef.id };
  } catch (error) {
    console.error('Error registering student for courses:', error);
    return { success: false, error: (error as any).message };
  }
}

export async function canStudentRegisterForSemester(
  studentId: string,
  academicYear: string,
  semester: number
): Promise<{ canRegister: boolean; reason?: string; existingRegistration?: any }> {
  try {
    console.log(`🚀🚀🚀 STUDENT PORTAL - ELIGIBILITY CHECK FUNCTION CALLED! 🚀🚀🚀`);
    console.log(`🚀 Student: ${studentId}`);
    console.log(`🚀 Academic Year: ${academicYear}`);
    console.log(`🚀 Semester: ${semester}`);
    console.log(`🚀 This function should determine if registration is allowed`);
    
    // Check for existing registration for this semester
    const existingRegistration = await getStudentCourseRegistration(studentId, academicYear, semester.toString());
    
    if (existingRegistration) {
      console.log(`Student already has registration for ${academicYear} - Semester ${semester}`);
      return {
        canRegister: false,
        reason: `You have already registered for courses in ${academicYear} - Semester ${semester}. You cannot register again until the next semester.`,
        existingRegistration
      };
    }
    
    // Check if student has any pending registrations that need approval
    const pendingRegistrations = await getStudentRegistrationHistory(studentId);
    const hasPendingRegistration = pendingRegistrations.some((reg: any) => 
      reg.status === 'pending' && 
      reg.academicYear === academicYear && 
      reg.semester === semester
    );
    
    if (hasPendingRegistration) {
      return {
        canRegister: false,
        reason: `You have a pending registration for ${academicYear} - Semester ${semester}. Please wait for approval before making changes.`
      };
    }

    // Check if fees are paid for the current semester
    try {
      console.log(`💰 Checking fee payment status for student ${studentId}`);
      console.log(`📅 Academic year: ${academicYear}, Semester: ${semester}`);
      
      // Get student info to determine programme type and level
      // Try multiple collections in order of likelihood
      let studentData: any | null = null;
      let foundInCollection = '';
      const tryCollections = [
        "student-registrations",
        "students",
        "users"
      ];
      
      console.log(`🔍 Looking for student ${studentId} in collections:`, tryCollections);
      
      for (const coll of tryCollections) {
        try {
          const snap = await getDoc(doc(db, coll, studentId));
          if (snap.exists()) {
            studentData = { id: studentId, ...snap.data() };
            foundInCollection = coll;
            console.log(`✅ Found student in ${coll}:`, {
              name: `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim(),
              registrationNumber: studentData.registrationNumber,
              programme: studentData.programme,
              currentLevel: studentData.currentLevel,
              programmeType: studentData.programmeType,
              scheduleType: studentData.scheduleType
            });
            break;
          }
        } catch (error) {
          console.log(`❌ Error checking ${coll}:`, error);
        }
      }

      if (!studentData) {
        console.log(`❌ Student ${studentId} not found in any collection`);
        return {
          canRegister: false,
          reason: "Student information not found. Please contact support."
        };
      }

      // Determine programme type (weekend vs regular)
      const programmeType = (
        studentData.programmeType === 'weekend' || 
        studentData.scheduleType?.toLowerCase().includes('weekend') ||
        studentData.programme?.toLowerCase().includes('weekend')
      ) ? 'weekend' : 'regular';

      // Extract level from currentLevel field (handles "Level 100", "100", etc.)
      const levelStr = studentData.currentLevel || studentData.level || '100';
      const level = parseInt(levelStr.replace(/\D/g, '')) || 100;
      
      console.log(`🎓 Student details:`, {
        programmeType,
        level,
        foundIn: foundInCollection,
        registrationNumber: studentData.registrationNumber,
        studentIndexNumber: studentData.studentIndexNumber
      });
      
      // Build alternative identifiers for payment lookups (registrationNumber, studentIndexNumber)
      const altIds: string[] = [];
      if (studentData.registrationNumber) altIds.push(studentData.registrationNumber);
      if (studentData.studentIndexNumber) altIds.push(studentData.studentIndexNumber);

      // Import the fee service dynamically to avoid circular dependencies
      console.log(`⏱️ Starting fee service import...`);
      const { getCurrentSemesterFees } = await import('../../FEES PORTAL/lib/academic-period-service');
      console.log(`⏱️ Fee service imported successfully`);
      
      // Add timeout for the fee check itself
      const feeCheckPromise = getCurrentSemesterFees(studentId, programmeType, level, altIds);
      const feeTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Fee check timeout")), 8000) // 8 second timeout for fee check
      });
      
      let semesterFees;
      try {
        console.log(`⏱️ Starting fee check with timeout...`);
        semesterFees = await Promise.race([feeCheckPromise, feeTimeoutPromise]);
        console.log(`⏱️ Fee check completed successfully`);
      } catch (feeCheckError) {
        if (feeCheckError.message === "Fee check timeout") {
          console.log(`⏱️ Fee check timed out - providing override option`);
          // If fee check times out, be conservative and assume fees are due
          return {
            canRegister: false,
            reason: "Fee verification is taking too long. If you have paid your fees, please use the 'Override Lock' button below.",
            feeDetails: {
              balance: 1,
              totalFees: 1,
              paidAmount: 0,
              programType: programmeType,
              level: level,
              semesterName: "Current Semester"
            }
          };
        } else {
          throw feeCheckError; // Re-throw other errors
        }
      }
      
      console.log(`💵 FEE CHECK DETAILED RESULT for student ${studentId}:`);
      console.log(`💵 Semester Fees Object:`, semesterFees);
      console.log(`💵 Balance Amount:`, semesterFees?.balance);
      console.log(`💵 Has Fee Data:`, !!semesterFees);
      console.log(`💵 Student Identifiers:`, {
        studentId,
        registrationNumber: studentData.registrationNumber,
        studentIndexNumber: studentData.studentIndexNumber,
        altIds
      });
      
      // Let's also check if the fee service is working
      if (!semesterFees) {
        console.log(`🚨 CRITICAL: No semester fees returned - fee calculation failed!`);
        console.log(`🚨 This means either:`);
        console.log(`🚨 1. Fee calculation service is not working`);
        console.log(`🚨 2. Student has no fee structure defined`);
        console.log(`🚨 3. Academic year/semester mismatch`);
      } else if (semesterFees.balance === undefined || semesterFees.balance === null) {
        console.log(`🚨 CRITICAL: Balance is undefined/null!`);
      } else if (semesterFees.balance === 0) {
        console.log(`✅ FEES PAID: Balance is 0, student can register`);
      } else if (semesterFees.balance > 0) {
        console.log(`🔒 FEES UNPAID: Balance is ¢${semesterFees.balance}, registration should be blocked`);
      }
      
      if (!semesterFees) {
        // If no fee data is found, assume fees are required but not calculated yet
        return {
          canRegister: false,
          reason: "Fee information not found. Please visit the Fees Portal to ensure your fees are calculated and paid.",
          feeDetails: {
            balance: 0,
            totalFees: 0,
            paidAmount: 0,
            programType: programmeType,
            level: level,
            semesterName: "Current Semester"
          }
        };
      }
      
      if (semesterFees.balance > 0) {
        const unpaidAmount = semesterFees.balance.toLocaleString();
        return {
          canRegister: false,
          reason: `Fees must be paid before course registration. You have an outstanding balance of ¢${unpaidAmount} for ${semesterFees.semesterName}. Please visit the Fees Portal to make payment.`,
          feeDetails: {
            balance: semesterFees.balance,
            totalFees: semesterFees.totalFees,
            paidAmount: semesterFees.paidAmount,
            programType: programmeType,
            level: level,
            semesterName: semesterFees.semesterName
          }
        };
      }
      
      // If balance is 0, fees are paid
      console.log(`✅ Fees paid for ${academicYear} - Semester ${semester}. Balance: ¢${semesterFees.balance}`);
      
    } catch (feeError) {
      console.error('❌ Error checking fee payment status:', feeError);
      
      // For students with unpaid fees, be strict about blocking registration
      // But provide a clear path to resolution
      return {
        canRegister: false,
        reason: "Fee payment verification failed. Please visit the Fees Portal to ensure your fees are paid, then try again. If you have already paid, please contact support.",
        feeDetails: {
          balance: 1000, // Assume there's a balance to be safe
          totalFees: 1000,
          paidAmount: 0,
          programType: 'regular',
          level: 100,
          semesterName: "Current Semester"
        }
      };
    }
    
    // Check if the registration period is open (you can add this logic based on your academic calendar)
    const currentDate = new Date();
    const academicYearStart = new Date(academicYear.split('/')[0], 8, 1); // September 1st
    const academicYearEnd = new Date(academicYear.split('/')[1], 5, 31); // May 31st
    
    if (currentDate < academicYearStart || currentDate > academicYearEnd) {
      return {
        canRegister: false,
        reason: `Registration is only open during the academic year ${academicYear}.`
      };
    }
    
    console.log(`Student can register for ${academicYear} - Semester ${semester}`);
    return { canRegister: true };
    
  } catch (error) {
    console.error("Error checking registration eligibility:", error);
    return {
      canRegister: false,
      reason: "Unable to verify registration eligibility. Please contact support."
    };
  }
}

export async function getStudentRegistrationHistory(studentId: string): Promise<any[]> {
  try {
    const registrationsQuery = query(
      collection(db, "course-registrations"),
      where("studentId", "==", studentId),
      orderBy("registrationDate", "desc")
    );
    
    const snapshot = await getDocs(registrationsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting registration history:", error);
    return [];
  }
}

// Helper function to generate default level data
function generateDefaultLevels(currentLevel: number, startYear: string, duration: number): AcademicLevel[] {
  const levels: AcademicLevel[] = [];
  const creditsPerLevel = 36;
  
  // Parse start year, defaulting to current year - duration if invalid
  let year = parseInt(startYear);
  if (isNaN(year)) {
    year = new Date().getFullYear() - (currentLevel / 100);
  }
  
  for (let level = 100; level <= duration * 100; level += 100) {
    const levelYear = year + ((level / 100) - 1);
    const nextYear = levelYear + 1;
    const academicYear = `${levelYear}/${nextYear}`;
    
    let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';
    let creditsEarned = 0;
    let gpa = 0;
    
    if (level < currentLevel) {
      status = 'completed';
      creditsEarned = creditsPerLevel;
      gpa = 3.0 + Math.random() * 1.0; // Random GPA between 3.0-4.0 for demo
    } else if (level === currentLevel) {
      status = 'in-progress';
      creditsEarned = creditsPerLevel;
    }
    
    levels.push({
      level: `Level ${level}`,
      levelNumber: level,
      creditsRequired: creditsPerLevel,
      creditsEarned,
      gpa: parseFloat(gpa.toFixed(2)),
      status,
      academicYear
    });
  }
  
  return levels;
} 

// This function will be used to convert program IDs to program names
export async function getProgramName(programId: string): Promise<string> {
  if (!programId) return "Unknown Program";
  
  try {
    // First check if it's already a program name (not an ID)
    if (programId.includes("BSc.") || programId.includes("B.Sc.")) {
      return programId;
    }
    
    // Look up the program in the academic-programs collection
    const programDoc = await getDoc(doc(db, "academic-programs", programId));
    
    if (programDoc.exists()) {
      const programData = programDoc.data();
      return programData.name || "Unknown Program";
    }
    
    return "Unknown Program";
  } catch (error) {
    console.error("Error getting program name:", error);
    return programId; // Return the ID if we can't get the name
  }
}