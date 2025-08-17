"use client"

import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase"

// Types for our data structures
export interface Student {
  id?: string
  indexNumber: string
  surname: string
  otherNames: string
  gender: string
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  religion: string
  maritalStatus: string
  passportNumber?: string
  nationalIdNumber: string
  ssnitNumber?: string
  numberOfChildren: number
  physicalChallenge: string
  programme: string
  yearOfAdmission: number
  yearOfCompletion: number
  entryQualification: string
  entryLevel: string
  currentLevel: string
  profilePicture?: string
  email: string
  mobileNumber: string
  telephoneNumber?: string
  address: {
    street: string
    city: string
    country: string
  }
  guardian: {
    name: string
    relationship: string
    contactNumber: string
    email: string
    address: string
  }
  emergencyContact: {
    name: string
    relationship: string
    contactNumber: string
    alternativeNumber?: string
  }
}

export interface CourseResult {
  courseCode: string
  courseTitle: string
  credits: number
  grade: string
  gradePoint: number
  totalPoints: number
  lecturer: string
  assessment?: number
  midsem?: number
  exams?: number
  total?: number
}

export interface SemesterResult {
  id?: string
  studentId: string
  academicYear: string
  semester: string
  courses: CourseResult[]
  semesterGPA: number
  totalCredits: number
  totalGradePoints: number
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  id?: string
  courseCode: string
  courseTitle: string
  credits: number
  lecturer: string
  schedule: string
  type: "Core" | "Elective"
  level: string
  semester: string
  prerequisite?: string
  isActive: boolean
}

export interface CourseRegistration {
  id?: string
  studentId: string
  academicYear: string
  semester: string
  courses: string[] // Array of course IDs
  totalCredits: number
  registrationDate: Date
  status: "Pending" | "Approved" | "Rejected"
}

// Student operations
export const getStudent = async (studentId: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, "students", studentId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting student:", error)
    throw error
  }
}

export const getStudentByIndexNumber = async (indexNumber: string): Promise<Student | null> => {
  try {
    const q = query(collection(db, "students"), where("indexNumber", "==", indexNumber))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Student
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting student by index number:", error)
    throw error
  }
}

export const updateStudent = async (studentId: string, data: Partial<Student>): Promise<void> => {
  try {
    const docRef = doc(db, "students", studentId)
    await updateDoc(docRef, data)
  } catch (error) {
    console.error("Error updating student:", error)
    throw error
  }
}

// Grades operations
export const getStudentGrades = async (studentId: string): Promise<SemesterResult[]> => {
  try {
    console.log(`Getting grades for student: ${studentId}`);
    
    // First, get the student's email, registration number, and index number from student-registrations
    let studentEmail: string | null = null;
    let studentRegistrationNumber: string | null = null;
    let studentIndexNumber: string | null = null;
    
    try {
      const studentDoc = await getDoc(doc(db, "student-registrations", studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        studentEmail = studentData.email;
        studentRegistrationNumber = studentData.registrationNumber;
        studentIndexNumber = studentData.studentIndexNumber;
        console.log(`Found student in student-registrations for grades lookup: ${studentData.surname} ${studentData.otherNames}`);
        console.log(`📧 Student email: ${studentEmail}`);
        console.log(`📋 Registration number: ${studentRegistrationNumber}`);
        console.log(`🔢 Index number: ${studentIndexNumber}`);
      }
    } catch (error) {
      console.warn("Error checking student-registrations for grades lookup:", error);
    }

    // Try multiple ways to find grades
    let allGrades: any[] = [];

    // Method 1: Search by studentId (document ID) in student-grades collection
    try {
      const studentGradesRef = collection(db, "student-grades")
      const studentGradesQuery = query(
        studentGradesRef,
        where("studentId", "==", studentId),
        where("status", "==", "published"),
        orderBy("academicYear", "desc"),
        orderBy("semester", "desc"),
      )
      const studentGradesSnapshot = await getDocs(studentGradesQuery)
      allGrades = [...allGrades, ...studentGradesSnapshot.docs]
      console.log(`Found ${studentGradesSnapshot.docs.length} grades by studentId in student-grades`)
    } catch (error) {
      console.warn("Error searching student-grades by studentId:", error);
    }

    // Method 2: Search by email in student-grades collection (most common case)
    if (studentEmail) {
      try {
        const studentGradesRef = collection(db, "student-grades")
        const studentGradesQuery = query(
          studentGradesRef,
          where("studentId", "==", studentEmail),
          where("status", "==", "published"),
          orderBy("academicYear", "desc"),
          orderBy("semester", "desc"),
        )
        const studentGradesSnapshot = await getDocs(studentGradesQuery)
        allGrades = [...allGrades, ...studentGradesSnapshot.docs]
        console.log(`Found ${studentGradesSnapshot.docs.length} grades by email in student-grades`)
      } catch (error) {
        console.warn("Error searching student-grades by email:", error);
      }
    }

    // Method 3: Search by registration number in student-grades collection
    if (studentRegistrationNumber) {
      try {
        const studentGradesRef = collection(db, "student-grades")
        const studentGradesQuery = query(
          studentGradesRef,
          where("studentId", "==", studentRegistrationNumber),
          where("status", "==", "published"),
          orderBy("academicYear", "desc"),
          orderBy("semester", "desc"),
        )
        const studentGradesSnapshot = await getDocs(studentGradesQuery)
        allGrades = [...allGrades, ...studentGradesSnapshot.docs]
        console.log(`Found ${studentGradesSnapshot.docs.length} grades by registration number in student-grades`)
      } catch (error) {
        console.warn("Error searching student-grades by registration number:", error);
      }
    }

    // Method 4: Search by index number in student-grades collection
    if (studentIndexNumber) {
      try {
        const studentGradesRef = collection(db, "student-grades")
        const studentGradesQuery = query(
          studentGradesRef,
          where("studentId", "==", studentIndexNumber),
          where("status", "==", "published"),
          orderBy("academicYear", "desc"),
          orderBy("semester", "desc"),
        )
        const studentGradesSnapshot = await getDocs(studentGradesQuery)
        allGrades = [...allGrades, ...studentGradesSnapshot.docs]
        console.log(`Found ${studentGradesSnapshot.docs.length} grades by index number in student-grades`)
      } catch (error) {
        console.warn("Error searching student-grades by index number:", error);
      }
    }

    // Method 5: Search by studentId in old grades collection
    try {
      const oldGradesRef = collection(db, "grades")
      const oldGradesQuery = query(
        oldGradesRef,
        where("studentId", "==", studentId),
        where("status", "==", "published"),
        orderBy("academicYear", "desc"),
        orderBy("semester", "desc"),
      )
      const oldGradesSnapshot = await getDocs(oldGradesQuery)
      allGrades = [...allGrades, ...oldGradesSnapshot.docs]
      console.log(`Found ${oldGradesSnapshot.docs.length} grades by studentId in old grades`)
    } catch (error) {
      console.warn("Error searching old grades by studentId:", error);
    }

    // Method 6: Search by email in old grades collection
    if (studentEmail) {
      try {
        const oldGradesRef = collection(db, "grades")
        const oldGradesQuery = query(
          oldGradesRef,
          where("studentId", "==", studentEmail),
          where("status", "==", "published"),
          orderBy("academicYear", "desc"),
          orderBy("semester", "desc"),
        )
        const oldGradesSnapshot = await getDocs(oldGradesQuery)
        allGrades = [...allGrades, ...oldGradesSnapshot.docs]
        console.log(`Found ${oldGradesSnapshot.docs.length} grades by email in old grades`)
      } catch (error) {
        console.warn("Error searching old grades by email:", error);
      }
    }
    
    // Remove duplicates based on document ID
    const uniqueGrades = allGrades.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );
    
    console.log(`📊 After removing duplicates: ${uniqueGrades.length} unique grades`);
    
    // Group by academic year and semester
    const groupedGrades: { [key: string]: any[] } = {}
    
    uniqueGrades.forEach(doc => {
      const gradeData = doc.data()
      const key = `${gradeData.academicYear}-${gradeData.semester}`
      
      if (!groupedGrades[key]) {
        groupedGrades[key] = []
      }
      groupedGrades[key].push(gradeData)
    })

    // Convert to SemesterResult format
    const semesterResults: SemesterResult[] = []
    
    for (const [key, grades] of Object.entries(groupedGrades)) {
      const [academicYear, semester] = key.split('-')
      
      // Group grades by course
      const gradesByCourse: { [courseId: string]: any[] } = {}
      
      grades.forEach(grade => {
        const courseId = grade.courseId || grade.courseCode
        
        if (!gradesByCourse[courseId]) {
          gradesByCourse[courseId] = []
        }
        gradesByCourse[courseId].push(grade)
      })

      // Convert to course results
      const courses: CourseResult[] = []
      let totalCredits = 0
      let totalGradePoints = 0

      for (const [courseId, courseGrades] of Object.entries(gradesByCourse)) {
        const grade = courseGrades[0] // Take the first grade for this course
        
        // Get course details
        let courseTitle = grade.courseTitle || grade.courseName || `Course ${courseId}`
        let credits = grade.credits || 3 // Default to 3 credits
        let lecturer = grade.lecturerName || grade.lecturerId || "Unknown Lecturer"
        
        // Try to fetch course details from courses collection
        try {
          const courseDoc = await getDoc(doc(db, "courses", courseId))
          if (courseDoc.exists()) {
            const courseData = courseDoc.data()
            courseTitle = courseData.title || courseData.courseTitle || courseData.name || courseTitle
            credits = courseData.credits || credits
            lecturer = courseData.lecturer || lecturer
          }
        } catch (error) {
          console.warn(`Could not fetch course details for ${courseId}:`, error)
        }

        const gradePoint = getGradePoint(grade.grade)
        const totalPoints = credits * gradePoint

        courses.push({
          courseCode: grade.courseCode || courseId,
          courseTitle,
          credits,
          grade: grade.grade,
          gradePoint,
          totalPoints,
          lecturer,
          assessment: grade.assessment,
          midsem: grade.midsem,
          exams: grade.exams,
          total: grade.total,
        })

        totalCredits += credits
        totalGradePoints += totalPoints
      }

      const semesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0

      semesterResults.push({
        id: `${studentId}-${academicYear}-${semester}`,
        studentId,
        academicYear,
        semester,
        courses,
        semesterGPA,
        totalCredits,
        totalGradePoints,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return semesterResults
  } catch (error) {
    console.error("Error getting student grades:", error)
    throw error
  }
}

// New function to get pre-populated semester results (like transcript but for specific semester)
export const getPrePopulatedSemesterResults = async (
  studentId: string,
  academicYear: string,
  semester: string,
): Promise<any | null> => {
  try {
    console.log(`Getting pre-populated results for student: ${studentId}, ${academicYear} ${semester}`);
    
    // Get student email from student-registrations
    let studentEmail = null;
    try {
      const studentDoc = await getDoc(doc(db, "student-registrations", studentId));
      if (studentDoc.exists()) {
        studentEmail = studentDoc.data().email;
      }
    } catch (error) {
      console.warn("Error getting student email:", error);
    }

    // Get course registrations for this specific semester
    let registrations = [];
    try {
      // Convert semester format for registration lookup
      let registrationSemester = semester;
      if (semester === "First Semester") {
        registrationSemester = "1";
      } else if (semester === "Second Semester") {
        registrationSemester = "2";
      }
      
      // Method 1: Search by studentId
      let q = query(
        collection(db, "course-registrations"), 
        where("studentId", "==", studentId),
        where("academicYear", "==", academicYear),
        where("semester", "==", registrationSemester)
      );
      let snapshot = await getDocs(q);
      
      registrations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${registrations.length} registrations by studentId`);
      
      // Method 2: If no results and we have email, try by email
      if (registrations.length === 0 && studentEmail) {
        q = query(
          collection(db, "course-registrations"), 
          where("email", "==", studentEmail),
          where("academicYear", "==", academicYear),
          where("semester", "==", registrationSemester)
        );
        snapshot = await getDocs(q);
        
        registrations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`Found ${registrations.length} registrations by email`);
      }
    } catch (error) {
      console.error("Error getting course registrations:", error);
    }

    if (registrations.length === 0) {
      console.log("No registrations found for this semester");
      return null;
    }

    // Get published grades for this semester
    const publishedGrades = await getGradesByYearAndSemester(studentId, academicYear, semester);
    
    // Get course details from courses collection
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const coursesMap = new Map();
    coursesSnapshot.docs.forEach(doc => {
      const courseData = doc.data();
      coursesMap.set(courseData.code, courseData);
    });

    // Build the semester result
    const registration = registrations[0]; // Take the first registration
    const courses = [];
    let totalCredits = 0;
    let totalGradePoints = 0;
    let hasGrades = false;

    // Process each course in the registration
    for (const course of registration.courses) {
      // Handle both string and object formats for courses
      let courseCode, courseTitle, courseCredits;
      
      if (typeof course === 'string') {
        courseCode = course;
        courseTitle = course;
        courseCredits = 3;
      } else {
        courseCode = course.courseCode || course.courseId || course.code;
        courseTitle = course.courseName || course.title || course.name || courseCode;
        courseCredits = course.credits || 3;
      }

      // Get course details from courses collection (if available)
      const courseDetails = coursesMap.get(courseCode) || {
        code: courseCode,
        title: courseTitle,
        credits: courseCredits
      };

      // Check if we have published grades for this course
      let publishedGrade = null;
      if (publishedGrades && publishedGrades.courses) {
        publishedGrade = publishedGrades.courses.find(c => c.courseCode === courseCode);
      }

      const courseEntry = {
        courseCode: courseCode,
        courseTitle: courseDetails.title || courseDetails.name || courseTitle,
        credits: courseDetails.credits || courseCredits,
        assessment: publishedGrade?.assessment || null,
        midsem: publishedGrade?.midsem || null,
        exams: publishedGrade?.exams || null,
        total: publishedGrade?.total || null,
        grade: publishedGrade ? publishedGrade.grade : "N/A",
        gradePoint: publishedGrade ? getGradePoint(publishedGrade.grade) : 0,
        totalPoints: publishedGrade ? (courseDetails.credits || courseCredits) * getGradePoint(publishedGrade.grade) : 0,
        status: publishedGrade ? "Published" : "Pending"
      };

      courses.push(courseEntry);
      totalCredits += courseEntry.credits;
      
      if (publishedGrade) {
        totalGradePoints += courseEntry.totalPoints;
        hasGrades = true;
      }
    }

    // Calculate semester GPA
    const semesterGPA = totalCredits > 0 && hasGrades ? totalGradePoints / totalCredits : 0;

    return {
      academicYear,
      semester,
      courses,
      totalCredits,
      totalGradePoints,
      semesterGPA,
      hasGrades
    };
    
  } catch (error) {
    console.error("Error getting pre-populated semester results:", error);
    return null;
  }
};

// Helper function to normalize semester format
const normalizeSemester = (semester: string): string => {
  if (semester === "First" || semester === "1" || semester === "Semester 1") return "First"
  if (semester === "Second" || semester === "2" || semester === "Semester 2") return "Second"
  return semester
}

const getReverseSemesterMapping = (semester: string): string => {
  if (semester === "First" || semester === "1") return "Semester 1"
  if (semester === "Second" || semester === "2") return "Semester 2"
  if (semester === "Semester 1") return "First"
  if (semester === "Semester 2") return "Second"
  return semester
}

export const getGradesByYearAndSemester = async (
  studentId: string,
  academicYear: string,
  semester: string,
): Promise<SemesterResult | null> => {
  try {
    console.log(`🔍 FIREBASE-UTILS: Getting grades for student: ${studentId}, ${academicYear} ${semester}`);
    
    // Normalize semester for search
    const normalizedSemester = normalizeSemester(semester)
    console.log(`🔍 Normalized semester: ${semester} -> ${normalizedSemester}`)
    
    // First, get the student's email from student-registrations
    let studentEmail: string | null = null;
    let studentRegistrationNumber: string | null = null;
    let studentIndexNumber: string | null = null;
    
    try {
      const studentDoc = await getDoc(doc(db, "student-registrations", studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        studentEmail = studentData.email;
        studentRegistrationNumber = studentData.registrationNumber;
        studentIndexNumber = studentData.studentIndexNumber;
        console.log(`✅ Found student in student-registrations: ${studentData.surname} ${studentData.otherNames}`);
        console.log(`📧 Student email: ${studentEmail}`);
        console.log(`📋 Registration number: ${studentRegistrationNumber}`);
        console.log(`🔢 Index number: ${studentIndexNumber}`);
      } else {
        console.log(`❌ Student ${studentId} not found in student-registrations`);
        
        // Try to find by registration number if studentId might be a registration number
        if (studentId.startsWith('UCAES')) {
          console.log(`🔍 Trying to find student by registration number: ${studentId}`);
          const regQuery = query(collection(db, "student-registrations"), where("registrationNumber", "==", studentId));
          const regSnapshot = await getDocs(regQuery);
          
          if (!regSnapshot.empty) {
            const regDoc = regSnapshot.docs[0];
            const regData = regDoc.data();
            studentEmail = regData.email;
            studentRegistrationNumber = regData.registrationNumber;
            studentIndexNumber = regData.studentIndexNumber;
            console.log(`✅ Found student by registration number: ${regData.surname} ${regData.otherNames}`);
            console.log(`📧 Student email: ${studentEmail}`);
            console.log(`📋 Registration number: ${studentRegistrationNumber}`);
            console.log(`🔢 Index number: ${studentIndexNumber}`);
          }
        }
      }
    } catch (error) {
      console.warn("❌ Error checking student-registrations for semester grades:", error);
    }

    // If we still don't have an email, try to find the student in the students collection
    if (!studentEmail) {
      try {
        console.log(`🔍 Trying to find student in students collection...`);
        
        // Try by document ID first
        const studentDoc = await getDoc(doc(db, "students", studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          studentEmail = studentData.email;
          studentRegistrationNumber = studentData.registrationNumber;
          studentIndexNumber = studentData.studentIndexNumber || studentData.indexNumber;
          console.log(`✅ Found student in students collection: ${studentData.surname} ${studentData.otherNames}`);
          console.log(`📧 Student email: ${studentEmail}`);
          console.log(`📋 Registration number: ${studentRegistrationNumber}`);
          console.log(`🔢 Index number: ${studentIndexNumber}`);
        } else {
          // Try by registration number
          if (studentId.startsWith('UCAES')) {
            const regQuery = query(collection(db, "students"), where("registrationNumber", "==", studentId));
            const regSnapshot = await getDocs(regQuery);
            
            if (!regSnapshot.empty) {
              const regDoc = regSnapshot.docs[0];
              const regData = regDoc.data();
              studentEmail = regData.email;
              studentRegistrationNumber = regData.registrationNumber;
              studentIndexNumber = regData.studentIndexNumber || regData.indexNumber;
              console.log(`✅ Found student by registration number in students: ${regData.surname} ${regData.otherNames}`);
              console.log(`📧 Student email: ${studentEmail}`);
              console.log(`📋 Registration number: ${studentRegistrationNumber}`);
              console.log(`🔢 Index number: ${studentIndexNumber}`);
            }
          }
        }
      } catch (error) {
        console.warn("❌ Error checking students collection:", error);
      }
    }

    // Try multiple ways to find grades
    let allGrades: any[] = [];

    // Method 1: Search by studentId (document ID) in student-grades collection
    try {
      console.log(`🔍 Method 1: Searching student-grades by studentId=${studentId}, year=${academicYear}, semester=${semester} (normalized: ${normalizedSemester})`);
      
      // Get reverse semester mapping for search
      const reverseSemester = getReverseSemesterMapping(semester)
      console.log(`🔍 Reverse semester mapping: ${semester} -> ${reverseSemester}`)
      
      // Try multiple semester formats to handle all possible variations
      const searchQueries = [
        // Original semester format
        query(
          collection(db, "student-grades"),
          where("studentId", "==", studentId),
          where("academicYear", "==", academicYear),
          where("semester", "==", semester),
          where("status", "==", "published"),
        ),
        // Normalized semester format
        query(
          collection(db, "student-grades"),
          where("studentId", "==", studentId),
          where("academicYear", "==", academicYear),
          where("semester", "==", normalizedSemester),
          where("status", "==", "published"),
        ),
        // Reverse semester mapping (e.g., "First" -> "Semester 1")
        query(
          collection(db, "student-grades"),
          where("studentId", "==", studentId),
          where("academicYear", "==", academicYear),
          where("semester", "==", reverseSemester),
          where("status", "==", "published"),
        )
      ]
      
      for (const queryRef of searchQueries) {
        const studentGradesSnapshot = await getDocs(queryRef)
        allGrades = [...allGrades, ...studentGradesSnapshot.docs]
        console.log(`📊 Method 1 result: Found ${studentGradesSnapshot.docs.length} grades by studentId in student-grades`)
        
        if (studentGradesSnapshot.docs.length > 0) {
          console.log('📋 Sample grade data:', studentGradesSnapshot.docs[0].data())
        }
      }
    } catch (error) {
      console.warn("Error searching student-grades by studentId:", error);
    }

    // Method 2: Search by email in student-grades collection (most common case - this is where grades are actually stored)
    if (studentEmail) {
      try {
        console.log(`🔍 Method 2: Searching student-grades by email=${studentEmail}, year=${academicYear}, semester=${semester} (normalized: ${normalizedSemester})`);
        
        // Get reverse semester mapping for search
        const reverseSemester = getReverseSemesterMapping(semester)
        console.log(`🔍 Reverse semester mapping: ${semester} -> ${reverseSemester}`)
        
        // Try multiple semester formats to handle all possible variations
        const searchQueries = [
          // Original semester format
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentEmail),
            where("academicYear", "==", academicYear),
            where("semester", "==", semester),
            where("status", "==", "published"),
          ),
          // Normalized semester format
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentEmail),
            where("academicYear", "==", academicYear),
            where("semester", "==", normalizedSemester),
            where("status", "==", "published"),
          ),
          // Reverse semester mapping (e.g., "First" -> "Semester 1")
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentEmail),
            where("academicYear", "==", academicYear),
            where("semester", "==", reverseSemester),
            where("status", "==", "published"),
          )
        ]
        
        for (const queryRef of searchQueries) {
          const studentGradesSnapshot = await getDocs(queryRef)
          allGrades = [...allGrades, ...studentGradesSnapshot.docs]
          console.log(`📊 Method 2 result: Found ${studentGradesSnapshot.docs.length} grades by email in student-grades`)
        }
      } catch (error) {
        console.warn("❌ Error searching student-grades by email:", error);
      }
    } else {
      console.log('⚠️ Method 2 skipped: No student email available');
    }

    // Method 3: Search by registration number in student-grades collection
    if (studentRegistrationNumber) {
      try {
        console.log(`🔍 Method 3: Searching student-grades by registration number=${studentRegistrationNumber}, year=${academicYear}, semester=${semester} (normalized: ${normalizedSemester})`);
        
        // Get reverse semester mapping for search
        const reverseSemester = getReverseSemesterMapping(semester)
        console.log(`🔍 Reverse semester mapping: ${semester} -> ${reverseSemester}`)
        
        // Try multiple semester formats to handle all possible variations
        const searchQueries = [
          // Original semester format
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentRegistrationNumber),
            where("academicYear", "==", academicYear),
            where("semester", "==", semester),
            where("status", "==", "published"),
          ),
          // Normalized semester format
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentRegistrationNumber),
            where("academicYear", "==", academicYear),
            where("semester", "==", normalizedSemester),
            where("status", "==", "published"),
          ),
          // Reverse semester mapping (e.g., "First" -> "Semester 1")
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentRegistrationNumber),
            where("academicYear", "==", academicYear),
            where("semester", "==", reverseSemester),
            where("status", "==", "published"),
          )
        ]
        
        for (const queryRef of searchQueries) {
          const studentGradesSnapshot = await getDocs(queryRef)
          allGrades = [...allGrades, ...studentGradesSnapshot.docs]
          console.log(`📊 Method 3 result: Found ${studentGradesSnapshot.docs.length} grades by registration number in student-grades`)
        }
      } catch (error) {
        console.warn("❌ Error searching student-grades by registration number:", error);
      }
    } else {
      console.log('⚠️ Method 3 skipped: No registration number available');
    }

    // Method 4: Search by index number in student-grades collection
    if (studentIndexNumber) {
      try {
        console.log(`🔍 Method 4: Searching student-grades by index number=${studentIndexNumber}, year=${academicYear}, semester=${semester} (normalized: ${normalizedSemester})`);
        
        // Get reverse semester mapping for search
        const reverseSemester = getReverseSemesterMapping(semester)
        console.log(`🔍 Reverse semester mapping: ${semester} -> ${reverseSemester}`)
        
        // Try multiple semester formats to handle all possible variations
        const searchQueries = [
          // Original semester format
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentIndexNumber),
            where("academicYear", "==", academicYear),
            where("semester", "==", semester),
            where("status", "==", "published"),
          ),
          // Normalized semester format
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentIndexNumber),
            where("academicYear", "==", academicYear),
            where("semester", "==", normalizedSemester),
            where("status", "==", "published"),
          ),
          // Reverse semester mapping (e.g., "First" -> "Semester 1")
          query(
            collection(db, "student-grades"),
            where("studentId", "==", studentIndexNumber),
            where("academicYear", "==", academicYear),
            where("semester", "==", reverseSemester),
            where("status", "==", "published"),
          )
        ]
        
        for (const queryRef of searchQueries) {
          const studentGradesSnapshot = await getDocs(queryRef)
          allGrades = [...allGrades, ...studentGradesSnapshot.docs]
          console.log(`📊 Method 4 result: Found ${studentGradesSnapshot.docs.length} grades by index number in student-grades`)
        }
      } catch (error) {
        console.warn("❌ Error searching student-grades by index number:", error);
      }
    } else {
      console.log('⚠️ Method 4 skipped: No index number available');
    }

    // Method 5: Search by studentId in old grades collection
    try {
      console.log(`🔍 Method 5: Searching old grades by studentId=${studentId}, year=${academicYear}, semester=${semester} (normalized: ${normalizedSemester})`);
      
      // Get reverse semester mapping for search
      const reverseSemester = getReverseSemesterMapping(semester)
      console.log(`🔍 Reverse semester mapping: ${semester} -> ${reverseSemester}`)
      
      // Try multiple semester formats to handle all possible variations
      const searchQueries = [
        // Original semester format
        query(
          collection(db, "grades"),
          where("studentId", "==", studentId),
          where("academicYear", "==", academicYear),
          where("semester", "==", semester),
          where("status", "==", "published"),
        ),
        // Normalized semester format
        query(
          collection(db, "grades"),
          where("studentId", "==", studentId),
          where("academicYear", "==", academicYear),
          where("semester", "==", normalizedSemester),
          where("status", "==", "published"),
        ),
        // Reverse semester mapping (e.g., "First" -> "Semester 1")
        query(
          collection(db, "grades"),
          where("studentId", "==", studentId),
          where("academicYear", "==", academicYear),
          where("semester", "==", reverseSemester),
          where("status", "==", "published"),
        )
      ]
      
      for (const queryRef of searchQueries) {
        const oldGradesSnapshot = await getDocs(queryRef)
        allGrades = [...allGrades, ...oldGradesSnapshot.docs]
        console.log(`📊 Method 5 result: Found ${oldGradesSnapshot.docs.length} grades by studentId in old grades`)
      }
    } catch (error) {
      console.warn("❌ Error searching old grades by studentId:", error);
    }

    // Method 6: Search by email in old grades collection
    if (studentEmail) {
      try {
        console.log(`🔍 Method 6: Searching old grades by email=${studentEmail}, year=${academicYear}, semester=${semester} (normalized: ${normalizedSemester})`);
        
        // Get reverse semester mapping for search
        const reverseSemester = getReverseSemesterMapping(semester)
        console.log(`🔍 Reverse semester mapping: ${semester} -> ${reverseSemester}`)
        
        // Try multiple semester formats to handle all possible variations
        const searchQueries = [
          // Original semester format
          query(
            collection(db, "grades"),
            where("studentId", "==", studentEmail),
            where("academicYear", "==", academicYear),
            where("semester", "==", semester),
            where("status", "==", "published"),
          ),
          // Normalized semester format
          query(
            collection(db, "grades"),
            where("studentId", "==", studentEmail),
            where("academicYear", "==", academicYear),
            where("semester", "==", normalizedSemester),
            where("status", "==", "published"),
          ),
          // Reverse semester mapping (e.g., "First" -> "Semester 1")
          query(
            collection(db, "grades"),
            where("studentId", "==", studentEmail),
            where("academicYear", "==", academicYear),
            where("semester", "==", reverseSemester),
            where("status", "==", "published"),
          )
        ]
        
        for (const queryRef of searchQueries) {
          const oldGradesSnapshot = await getDocs(queryRef)
          allGrades = [...allGrades, ...oldGradesSnapshot.docs]
          console.log(`📊 Method 6 result: Found ${oldGradesSnapshot.docs.length} grades by email in old grades`)
        }
      } catch (error) {
        console.warn("❌ Error searching old grades by email:", error);
      }
    } else {
      console.log('⚠️ Method 6 skipped: No student email available');
    }

    console.log(`📈 TOTAL GRADES FOUND: ${allGrades.length} across all search methods`);

    if (!allGrades.length) {
      console.log(`❌ No grades found for student ${studentId} (email: ${studentEmail}, reg: ${studentRegistrationNumber}, index: ${studentIndexNumber}) in ${academicYear} ${semester}`);
      return null
    }

    // Remove duplicates based on document ID
    const uniqueGrades = allGrades.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    );
    
    console.log(`📊 After removing duplicates: ${uniqueGrades.length} unique grades`);

    // Group grades by course and create course results
    const gradesByCourse: { [courseId: string]: any[] } = {}
    
    uniqueGrades.forEach(doc => {
      const gradeData = doc.data()
      const courseId = gradeData.courseId || gradeData.courseCode
      
      if (!gradesByCourse[courseId]) {
        gradesByCourse[courseId] = []
      }
      gradesByCourse[courseId].push(gradeData)
    })

    // Convert to course results
    const courses: CourseResult[] = []
    let totalCredits = 0
    let totalGradePoints = 0

    for (const [courseId, grades] of Object.entries(gradesByCourse)) {
      const grade = grades[0] // Take the first grade for this course
      
      // Get course details
      let courseTitle = grade.courseTitle || grade.courseName || `Course ${courseId}`
      let credits = grade.credits || 3 // Default to 3 credits
      let lecturer = grade.lecturerName || grade.lecturerId || "Unknown Lecturer"
      
      // Try to fetch course details from courses collection
      try {
        const courseDoc = await getDoc(doc(db, "courses", courseId))
        if (courseDoc.exists()) {
          const courseData = courseDoc.data()
          courseTitle = courseData.title || courseData.courseTitle || courseData.name || courseTitle
          credits = courseData.credits || credits
          lecturer = courseData.lecturer || lecturer
        }
      } catch (error) {
        console.warn(`Could not fetch course details for ${courseId}:`, error)
      }

      const gradePoint = getGradePoint(grade.grade)
      const totalPoints = credits * gradePoint

      courses.push({
        courseCode: grade.courseCode || courseId,
        courseTitle,
        credits,
        grade: grade.grade,
        gradePoint,
        totalPoints,
        lecturer,
        assessment: grade.assessment,
        midsem: grade.midsem,
        exams: grade.exams,
        total: grade.total,
      })

      totalCredits += credits
      totalGradePoints += totalPoints
    }

    const semesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0

    return {
      id: `${studentId}-${academicYear}-${semester}`,
      studentId,
      academicYear,
      semester,
      courses,
      semesterGPA,
      totalCredits,
      totalGradePoints,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error getting grades by year and semester:", error)
    throw error
  }
}

// Helper function to get grade point
const getGradePoint = (grade: string): number => {
  const gradePoints: { [key: string]: number } = {
    "A+": 4.0,
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.3,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.3,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.3,
    "D": 1.0,
    "E": 0.5,
    "F": 0.0,
  }
  return gradePoints[grade] || 0.0
}

// New function to get pre-populated student transcript
export const getStudentTranscript = async (studentId: string): Promise<any> => {
  try {
    console.log(`Getting complete transcript for student: ${studentId}`);
    
    // Get student email from student-registrations
    let studentEmail = null;
    try {
      const studentDoc = await getDoc(doc(db, "student-registrations", studentId));
      if (studentDoc.exists()) {
        studentEmail = studentDoc.data().email;
      }
    } catch (error) {
      console.warn("Error getting student email:", error);
    }

    // Get course registrations directly from course-registrations collection (like Course Registration page does)
    let registrations = [];
    try {
      // Method 1: Search by studentId
      let q = query(collection(db, "course-registrations"), where("studentId", "==", studentId));
      let snapshot = await getDocs(q);
      
      registrations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${registrations.length} registrations by studentId`);
      
      // Method 2: If no results and we have email, try by email
      if (registrations.length === 0 && studentEmail) {
        q = query(collection(db, "course-registrations"), where("email", "==", studentEmail));
        snapshot = await getDocs(q);
        
        registrations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`Found ${registrations.length} registrations by email`);
      }
    } catch (error) {
      console.error("Error getting course registrations:", error);
    }

    // Get all published grades for this student
    const publishedGrades = await getStudentGrades(studentId);
    console.log(`Found ${publishedGrades.length} published grade records`);

    // Create a map of published grades by academic year and semester
    const gradesMap = new Map();
    publishedGrades.forEach(gradeRecord => {
      const key = `${gradeRecord.academicYear}-${gradeRecord.semester}`;
      if (!gradesMap.has(key)) {
        gradesMap.set(key, {});
      }
      gradeRecord.courses.forEach(course => {
        gradesMap.get(key)[course.courseCode] = course;
      });
    });

    // Get course details from courses collection
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const coursesMap = new Map();
    coursesSnapshot.docs.forEach(doc => {
      const courseData = doc.data();
      coursesMap.set(courseData.code, courseData);
    });

    // Build transcript by academic year and semester
    const transcript = {};

    for (const registration of registrations) {
      const { academicYear, semester, courses } = registration;
      
      // Normalize semester format - convert "1" to "First Semester", "2" to "Second Semester"
      let normalizedSemester = semester;
      if (semester === "1" || semester === 1) {
        normalizedSemester = "First Semester";
      } else if (semester === "2" || semester === 2) {
        normalizedSemester = "Second Semester";
      }
      
      const key = `${academicYear}-${normalizedSemester}`;
      
      console.log(`Processing registration for ${academicYear}-${semester} (normalized: ${normalizedSemester})`);
      
      if (!transcript[key]) {
        transcript[key] = {
          academicYear,
          semester: normalizedSemester,
          courses: [],
          totalCredits: 0,
          totalGradePoints: 0,
          semesterGPA: 0,
          hasGrades: false
        };
      }

      // Process each course in the registration
      for (const course of courses) {
        // Handle both string and object formats for courses
        let courseCode, courseTitle, courseCredits;
        
        if (typeof course === 'string') {
          // Old format: course is just a string (course code)
          courseCode = course;
          courseTitle = course;
          courseCredits = 3; // Default
        } else {
          // New format: course is an object with courseCode, courseName, credits, etc.
          courseCode = course.courseCode || course.courseId || course.code;
          courseTitle = course.courseName || course.title || course.name || courseCode;
          courseCredits = course.credits || 3;
        }

        // Get course details from courses collection (if available)
        const courseDetails = coursesMap.get(courseCode) || {
          code: courseCode,
          title: courseTitle,
          credits: courseCredits
        };

        // Check if we have published grades for this course
        const publishedGrade = gradesMap.get(key)?.[courseCode];

        const courseEntry = {
          courseCode: courseCode,
          courseTitle: courseDetails.title || courseDetails.name || courseTitle,
          credits: courseDetails.credits || courseCredits,
          assessment: publishedGrade?.assessment || null,
          midsem: publishedGrade?.midsem || null,
          exams: publishedGrade?.exams || null,
          total: publishedGrade?.total || null,
          grade: publishedGrade?.grade || "N/A",
          gradePoint: publishedGrade ? getGradePoint(publishedGrade.grade) : 0,
          totalPoints: publishedGrade ? (courseDetails.credits || 3) * getGradePoint(publishedGrade.grade) : 0,
          status: publishedGrade ? "Published" : "Pending"
        };

        transcript[key].courses.push(courseEntry);
        transcript[key].totalCredits += courseEntry.credits;
        
        if (publishedGrade) {
          transcript[key].totalGradePoints += courseEntry.totalPoints;
          transcript[key].hasGrades = true;
        }
      }

      // Calculate semester GPA
      if (transcript[key].totalCredits > 0 && transcript[key].hasGrades) {
        transcript[key].semesterGPA = transcript[key].totalGradePoints / transcript[key].totalCredits;
      }
    }

    return transcript;
  } catch (error) {
    console.error("Error getting student transcript:", error);
    return {};
  }
};

export const addGrades = async (grades: Omit<SemesterResult, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "grades"), {
      ...grades,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding grades:", error)
    throw error
  }
}

// Course operations
export const getCourses = async (level?: string, semester?: string): Promise<Course[]> => {
  try {
    let q = query(collection(db, "courses"), where("isActive", "==", true))

    if (level) {
      q = query(q, where("level", "==", level))
    }

    if (semester) {
      q = query(q, where("semester", "==", semester))
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[]
  } catch (error) {
    console.error("Error getting courses:", error)
    throw error
  }
}

export const getCourse = async (courseId: string): Promise<Course | null> => {
  try {
    const docRef = doc(db, "courses", courseId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Course
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting course:", error)
    throw error
  }
}

// Course registration operations
export const getStudentRegistrations = async (studentId: string): Promise<CourseRegistration[]> => {
  try {
    console.log(`Getting registrations for student: ${studentId}`);
    
    // First, check if this student exists in student-registrations
    let studentDoc = null;
    let studentEmail = null;
    
    try {
      studentDoc = await getDoc(doc(db, "student-registrations", studentId));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        studentEmail = studentData.email;
        console.log(`Found student in student-registrations: ${studentData.surname} ${studentData.otherNames}`);
      }
    } catch (error) {
      console.warn("Error checking student-registrations:", error);
    }

    // Try multiple collections where registrations might be stored
    const collections = ['course-registrations', 'student-registrations', 'registrations']
    let allRegistrations: CourseRegistration[] = []
    
    for (const collectionName of collections) {
      try {
        // Method 1: Search by studentId (document ID)
        let q = query(
          collection(db, collectionName),
          where("studentId", "==", studentId)
        )
        let querySnapshot = await getDocs(q)
        
        const registrationsById = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CourseRegistration[]
        
        allRegistrations = [...allRegistrations, ...registrationsById]
        console.log(`Found ${registrationsById.length} registrations by studentId in ${collectionName}`)
        
        // Method 2: Search by email (if we have it)
        if (studentEmail) {
          q = query(
            collection(db, collectionName),
            where("email", "==", studentEmail)
          )
          querySnapshot = await getDocs(q)
          
          const registrationsByEmail = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CourseRegistration[]
          
          allRegistrations = [...allRegistrations, ...registrationsByEmail]
          console.log(`Found ${registrationsByEmail.length} registrations by email in ${collectionName}`)
        }
        
        // Method 3: Search by email as studentId (for backward compatibility)
        if (studentEmail) {
          q = query(
            collection(db, collectionName),
            where("studentId", "==", studentEmail)
          )
          querySnapshot = await getDocs(q)
          
          const registrationsByEmailAsId = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CourseRegistration[]
          
          allRegistrations = [...allRegistrations, ...registrationsByEmailAsId]
          console.log(`Found ${registrationsByEmailAsId.length} registrations by email as studentId in ${collectionName}`)
        }
        
      } catch (error) {
        console.warn(`Error checking ${collectionName} collection:`, error)
        continue
      }
    }
    
    // Remove duplicates based on academicYear and semester
    const uniqueRegistrations = allRegistrations.filter((reg, index, self) => 
      index === self.findIndex(r => 
        r.academicYear === reg.academicYear && r.semester === reg.semester
      )
    )
    
    console.log(`Total unique registrations found: ${uniqueRegistrations.length}`)
    return uniqueRegistrations
    
  } catch (error) {
    console.error("Error getting student registrations:", error)
    throw error
  }
}

export const addCourseRegistration = async (registration: Omit<CourseRegistration, "id">): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "registrations"), {
      ...registration,
      registrationDate: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding course registration:", error)
    throw error
  }
}

export const updateCourseRegistration = async (
  registrationId: string,
  data: Partial<CourseRegistration>,
): Promise<void> => {
  try {
    const docRef = doc(db, "registrations", registrationId)
    await updateDoc(docRef, data)
  } catch (error) {
    console.error("Error updating course registration:", error)
    throw error
  }
}

// Utility functions
export const calculateGPA = (courses: CourseResult[]): number => {
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const totalGradePoints = courses.reduce((sum, course) => sum + course.totalPoints, 0)

  return totalCredits > 0 ? totalGradePoints / totalCredits : 0
}

export const calculateCumulativeGPA = (semesterResults: SemesterResult[]): number => {
  const totalCredits = semesterResults.reduce((sum, result) => sum + result.totalCredits, 0)
  const totalGradePoints = semesterResults.reduce((sum, result) => sum + result.totalGradePoints, 0)

  return totalCredits > 0 ? totalGradePoints / totalCredits : 0
}

// Get all available academic years from the system
export const getAvailableAcademicYears = async (): Promise<string[]> => {
  try {
    const yearsRef = collection(db, "academic-years")
    const yearsQuery = query(yearsRef, orderBy("year", "desc"))
    const yearsSnapshot = await getDocs(yearsQuery)
    
    const years = yearsSnapshot.docs.map(doc => doc.data().year)
    console.log("Available academic years:", years)
    return years
  } catch (error) {
    console.error("Error getting available academic years:", error)
    return []
  }
}
