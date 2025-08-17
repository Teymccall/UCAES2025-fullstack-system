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
    
    // Get courses for this level and semester
    // FIXED: Use numeric keys (1, 2) instead of text keys to match Firebase structure
    const levelKey = level.toString();
    const semesterKey = semester.toString(); // Use "1" or "2" instead of "First Semester" / "Second Semester"
    
    console.log(`Looking for courses in: Level ${levelKey}, Semester ${semesterKey}`);
    
    if (coursesPerLevel[levelKey]) {
      console.log(`Available semesters for level ${levelKey}:`, Object.keys(coursesPerLevel[levelKey]));
    }
    
    if (!coursesPerLevel[levelKey] || !coursesPerLevel[levelKey][semesterKey]) {
      console.log(`❌ No course structure found for Level ${levelKey}, Semester ${semesterKey}`);
      return [];
    }
    
    const semesterData = coursesPerLevel[levelKey][semesterKey];
    console.log(`✅ Semester data found:`, semesterData);
    
    // Get course codes from the semester data
    const courseCodes = semesterData.all?.Regular || [];
    console.log(`Found ${courseCodes.length} course codes:`, courseCodes);
    
    if (courseCodes.length === 0) {
      console.log(`❌ No course codes found for Level ${levelKey}, Semester ${semesterKey}`);
      return [];
    }
    
    // Get actual course details
    const coursesQuery = query(
      collection(db, "academic-courses"),
      where("code", "in", courseCodes.slice(0, 10)) // Firestore 'in' query limit
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    const availableCourses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Retrieved ${availableCourses.length} courses from database`);
    
    // Check if student is already registered for any of these courses
    const existingRegistration = await getStudentCourseRegistration(studentId, academicYear, semester);
    const registeredCourseIds = existingRegistration?.courses?.map(c => c.id || c.courseId) || [];
    
    // Filter out already registered courses
    const filteredCourses = availableCourses.filter(course => 
      !registeredCourseIds.includes(course.id) && 
      course.status === 'active'
    );
    
    console.log(`Final filtered courses: ${filteredCourses.length} available for registration`);
    
    return filteredCourses;
  } catch (error) {
    console.error("Error getting available courses:", error);
    return [];
  }
}

export async function canStudentRegisterForSemester(
  studentId: string,
  academicYear: string,
  semester: number
): Promise<{ canRegister: boolean; reason?: string; existingRegistration?: any }> {
  try {
    console.log(`Checking if student ${studentId} can register for ${academicYear} - Semester ${semester}`);
    
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

export async function registerStudentForCourses(
  studentId: string,
  courses: any[],
  academicYear: string,
  semester: number,
  registrationType: 'student' | 'director' = 'student'
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  try {
    console.log(`Registering student ${studentId} for ${courses.length} courses`);
    
    // Check if student can register for this semester
    const registrationCheck = await canStudentRegisterForSemester(studentId, academicYear, semester);
    if (!registrationCheck.canRegister) {
      return { success: false, error: registrationCheck.reason || "Registration not allowed" };
    }
    
    // Get student information - we need to get the student object first
    const studentDoc = await getDoc(doc(db, "users", studentId));
    if (!studentDoc.exists()) {
      return { success: false, error: "Student not found" };
    }
    
    const studentData = studentDoc.data() as any;
    const studentInfo = await getAcademicRecord(studentData);
    if (!studentInfo) {
      return { success: false, error: "Student academic record not found" };
    }
    
    // Get program ID from student data or resolve from program name
    let programId = studentData.programId || '';
    if (!programId && studentData.programme) {
      const { getProgramIdFromName } = await import('@/lib/academic-service');
      programId = await getProgramIdFromName(studentData.programme) || '';
    }
    
    // Validate course availability
    const availableCourses = await getAvailableCoursesForStudent(
      studentId,
      programId,
      parseInt(studentData.currentLevel?.replace(/\D/g, '') || '100'),
      semester,
      academicYear
    );
    
    const availableCourseIds = availableCourses.map(c => c.id);
    const invalidCourses = courses.filter(course => !availableCourseIds.includes(course.id));
    
    if (invalidCourses.length > 0) {
      return { success: false, error: "Some courses are not available for registration" };
    }
    
    // Create registration document
    const registrationData = {
      studentId,
      studentName: studentData.name || `${studentData.surname || ''} ${studentData.otherNames || ''}`.trim(),
      registrationNumber: studentInfo.registrationNumber,
      email: studentData.email,
      programId: programId,
      programName: studentData.programme || studentInfo.programme,
      level: studentInfo.currentLevel,
      semester,
      academicYear,
      courses: courses.map(course => ({
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits
      })),
      totalCredits: courses.reduce((sum, course) => sum + (course.credits || 0), 0),
      registrationDate: new Date(),
      registrationType,
      status: registrationType === 'director' ? 'approved' : 'pending', // Students get pending status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const registrationRef = await addDoc(collection(db, "course-registrations"), registrationData);
    
    console.log(`Successfully registered student for ${courses.length} courses`);
    return { success: true, registrationId: registrationRef.id };
    
  } catch (error) {
    console.error("Error registering student for courses:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
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