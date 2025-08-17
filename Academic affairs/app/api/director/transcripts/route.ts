import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

console.log('🔥 TRANSCRIPT API: Firebase instance:', db ? 'SUCCESS' : 'FAILED');

// Types for transcript data
interface CourseResult {
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
  status: 'Published' | 'Pending'
}

interface SemesterResult {
  academicYear: string
  semester: string
  courses: CourseResult[]
  semesterGPA: number
  totalCredits: number
  totalGradePoints: number
  hasGrades: boolean
}

interface StudentInfo {
  id: string
  registrationNumber: string
  name: string
  email: string
  program: string
  level: string
  dateOfBirth?: string
  gender?: string
  entryLevel?: string
  currentLevel?: string
  yearOfAdmission?: number
  profilePictureUrl?: string
}

interface TranscriptData {
  student: StudentInfo
  semesters: SemesterResult[]
  summary: {
    totalCreditsEarned: number
    totalCreditsAttempted: number
    cumulativeGPA: number
    currentLevel: string
    classStanding: string
    academicStatus: string
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

// Helper function to determine class standing
const getClassStanding = (gpa: number): string => {
  if (gpa >= 3.6) return "First Class"
  if (gpa >= 3.0) return "Second Class Upper"
  if (gpa >= 2.5) return "Second Class Lower"
  if (gpa >= 2.0) return "Third Class"
  return "Pass"
}

// Helper function to determine academic status
const getAcademicStatus = (gpa: number): string => {
  if (gpa >= 3.5) return "Excellent"
  if (gpa >= 3.0) return "Good Standing"
  if (gpa >= 2.0) return "Satisfactory"
  return "Probation"
}

// Get student information using working Firebase
const getStudentInfo = async (studentId: string): Promise<StudentInfo | null> => {
  try {
    // Use working Firebase initialization
    const { initializeApp: initApp, getApps } = require('firebase/app')
    const { getFirestore: getFS, doc: d, getDoc: gd } = require('firebase/firestore')
    
    const firebaseConfig = {
      apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
      authDomain: "ucaes2025.firebaseapp.com",
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
      projectId: "ucaes2025",
      storageBucket: "ucaes2025.firebasestorage.app",
      messagingSenderId: "543217800581",
      appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
      measurementId: "G-8E3518ML0D"
    }

    let workingApp
    const existingApps = getApps()
    if (existingApps.length === 0) {
      workingApp = initApp(firebaseConfig)
    } else {
      workingApp = existingApps[0]
    }

    const workingDb = getFS(workingApp)
    
    // Try student-registrations first
    let studentDoc = await gd(d(workingDb, "student-registrations", studentId))
    
    if (studentDoc.exists()) {
      const data = studentDoc.data()
      const name = data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim()
      return {
        id: studentDoc.id,
        registrationNumber: data.registrationNumber || data.studentIndexNumber || data.indexNumber || studentId,
        name,
        email: data.email || '',
        program: data.programme || data.program || '',
        level: data.currentLevel || data.entryLevel || data.level || '100',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        entryLevel: data.entryLevel || '100',
        currentLevel: data.currentLevel || data.entryLevel || data.level || '100',
        yearOfAdmission: data.yearOfAdmission || data.yearOfEntry || new Date().getFullYear(),
        profilePictureUrl: data.profilePictureUrl || ''
      }
    }

    // Try students collection
    studentDoc = await gd(d(workingDb, "students", studentId))
    
    if (studentDoc.exists()) {
      const data = studentDoc.data()
      const name = data.name || 
                   `${data.surname || ''} ${data.otherNames || ''}`.trim() ||
                   `${data.firstName || ''} ${data.lastName || ''}`.trim()
      return {
        id: studentDoc.id,
        registrationNumber: data.registrationNumber || data.studentIndexNumber || data.indexNumber || studentId,
        name,
        email: data.email || '',
        program: data.program || data.programme || '',
        level: data.level || data.currentLevel || '100',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        entryLevel: data.entryLevel || '100',
        currentLevel: data.currentLevel || data.level || '100',
        yearOfAdmission: data.yearOfAdmission || data.yearOfEntry || new Date().getFullYear(),
        profilePictureUrl: data.profilePictureUrl || ''
      }
    }

    // Try by registration number if studentId looks like one
    if (studentId.startsWith('UCAES')) {
      const regQuery = query(
        collection(db, "student-registrations"), 
        where("registrationNumber", "==", studentId)
      )
      const regSnapshot = await getDocs(regQuery)
      
      if (!regSnapshot.empty) {
        const regDoc = regSnapshot.docs[0]
        const data = regDoc.data()
        const name = data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim()
        return {
          id: regDoc.id,
          registrationNumber: data.registrationNumber || data.studentIndexNumber || studentId,
          name,
          email: data.email || '',
          program: data.programme || data.program || '',
          level: data.currentLevel || data.entryLevel || data.level || '100',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          entryLevel: data.entryLevel || '100',
          currentLevel: data.currentLevel || data.entryLevel || data.level || '100',
          yearOfAdmission: data.yearOfAdmission || data.yearOfEntry || new Date().getFullYear(),
          profilePictureUrl: data.profilePictureUrl || ''
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error getting student info:", error)
    return null
  }
}

// Get all published grades for a student using working Firebase
const getStudentTranscript = async (studentId: string, studentEmail?: string): Promise<SemesterResult[]> => {
  try {
    // Use working Firebase initialization (same as the fixed search)
    const { initializeApp: initApp, getApps } = require('firebase/app')
    const { getFirestore: getFS, collection: coll, getDocs: getDcs, query: q, where: w } = require('firebase/firestore')
    
    const firebaseConfig = {
      apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
      authDomain: "ucaes2025.firebaseapp.com",
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
      projectId: "ucaes2025",
      storageBucket: "ucaes2025.firebasestorage.app",
      messagingSenderId: "543217800581",
      appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
      measurementId: "G-8E3518ML0D"
    }

    let workingApp
    const existingApps = getApps()
    if (existingApps.length === 0) {
      workingApp = initApp(firebaseConfig)
    } else {
      workingApp = existingApps[0]
    }

    const workingDb = getFS(workingApp)
    let allGrades: any[] = []

    // Search multiple ways to find grades
    const searchMethods = [
      { field: "studentId", value: studentId, collection: "student-grades" },
      { field: "studentId", value: studentEmail, collection: "student-grades" },
      { field: "studentId", value: studentId, collection: "grades" },
      { field: "studentId", value: studentEmail, collection: "grades" },
    ]

    for (const method of searchMethods) {
      if (!method.value) continue
      
      try {
        const gradesQuery = q(
          coll(workingDb, method.collection),
          w(method.field, "==", method.value),
          w("status", "==", "published")
        )
        const gradesSnapshot = await getDcs(gradesQuery)
        allGrades = [...allGrades, ...gradesSnapshot.docs]
      } catch (error) {
        console.warn(`Error searching ${method.collection} by ${method.field}:`, error)
      }
    }

    // Remove duplicates
    const uniqueGrades = allGrades.filter((doc, index, self) => 
      index === self.findIndex(d => d.id === doc.id)
    )

    // Group by academic year and semester with normalized semester format
    const groupedGrades: { [key: string]: any[] } = {}
    
    // Helper function to normalize semester format
    const normalizeSemester = (semester: string): string => {
      if (!semester) return 'Unknown'
      const lower = semester.toLowerCase()
      if (lower.includes('first') || lower.includes('1')) return 'First'
      if (lower.includes('second') || lower.includes('2')) return 'Second'
      if (lower.includes('third') || lower.includes('3')) return 'Third'
      return semester
    }
    
    uniqueGrades.forEach(doc => {
      const gradeData = doc.data()
      const normalizedSemester = normalizeSemester(gradeData.semester)
      const key = `${gradeData.academicYear}|${normalizedSemester}` // Use pipe separator to avoid conflicts
      
      if (!groupedGrades[key]) {
        groupedGrades[key] = []
      }
      groupedGrades[key].push(gradeData)
    })

    // Convert to SemesterResult format
    const semesterResults: SemesterResult[] = []
    
    for (const [key, grades] of Object.entries(groupedGrades)) {
      // Split key using pipe separator (safer than dashes)
      const [academicYear, semester] = key.split('|')
      
      if (!academicYear || !semester) {
        console.warn(`Invalid key format: ${key}`)
        continue
      }
      
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
          status: 'Published'
        })

        totalCredits += credits
        totalGradePoints += totalPoints
      }

      const semesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0

      semesterResults.push({
        academicYear,
        semester,
        courses: courses.sort((a, b) => a.courseCode.localeCompare(b.courseCode)),
        semesterGPA,
        totalCredits,
        totalGradePoints,
        hasGrades: courses.length > 0
      })
    }

    // Sort by academic year and semester
    return semesterResults.sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return a.academicYear.localeCompare(b.academicYear)
      }
      const semesterOrder = { "First": 1, "Second": 2, "Third": 3 }
      return (semesterOrder[a.semester as keyof typeof semesterOrder] || 0) - 
             (semesterOrder[b.semester as keyof typeof semesterOrder] || 0)
    })
  } catch (error) {
    console.error("Error getting student transcript:", error)
    return []
  }
}

// GET: Fetch transcript for a specific student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    console.log(`Fetching transcript for student: ${studentId}`)

    // Get student information
    const student = await getStudentInfo(studentId)
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Get transcript data
    const semesters = await getStudentTranscript(studentId, student.email)

    // Calculate summary statistics
    const totalCreditsEarned = semesters.reduce((sum, sem) => {
      return sum + sem.courses.filter(course => course.grade !== 'F').reduce((credSum, course) => credSum + course.credits, 0)
    }, 0)
    
    const totalCreditsAttempted = semesters.reduce((sum, sem) => sum + sem.totalCredits, 0)
    
    const totalGradePoints = semesters.reduce((sum, sem) => sum + sem.totalGradePoints, 0)
    const cumulativeGPA = totalCreditsAttempted > 0 ? totalGradePoints / totalCreditsAttempted : 0

    const transcriptData: TranscriptData = {
      student,
      semesters,
      summary: {
        totalCreditsEarned,
        totalCreditsAttempted,
        cumulativeGPA,
        currentLevel: student.currentLevel || student.level,
        classStanding: getClassStanding(cumulativeGPA),
        academicStatus: getAcademicStatus(cumulativeGPA)
      }
    }

    return NextResponse.json(transcriptData)
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}

// POST: Search for students (for transcript lookup)
export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json()

    console.log(`🔍 Searching for students with term: "${searchTerm}"`)

    if (!searchTerm || searchTerm.length < 2) {
      console.log('❌ Search term too short or empty')
      return NextResponse.json([])
    }

    let students: StudentInfo[] = []

    // Search in student-registrations using working method
    try {
      console.log(`🔍 Starting search in student-registrations for: "${searchTerm}"`)
      
      // Use direct Firebase client initialization (like the working test)
      const { initializeApp: initApp, getApps } = require('firebase/app')
      const { getFirestore: getFS, collection: coll, getDocs: getDcs, query: q, where: w } = require('firebase/firestore')
      
      const firebaseConfig = {
        apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
        authDomain: "ucaes2025.firebaseapp.com",
        databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
        projectId: "ucaes2025",
        storageBucket: "ucaes2025.firebasestorage.app",
        messagingSenderId: "543217800581",
        appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
        measurementId: "G-8E3518ML0D"
      }

      // Initialize Firebase (avoid conflicts)
      let workingApp
      const existingApps = getApps()
      if (existingApps.length === 0) {
        workingApp = initApp(firebaseConfig)
        console.log('🔥 Firebase initialized for transcript search')
      } else {
        workingApp = existingApps[0]
        console.log('🔥 Using existing Firebase app for transcript search')
      }

      const workingDb = getFS(workingApp)
      
      // Method 1: Direct query by registration number (most efficient)
      if (searchTerm.startsWith('UCAES')) {
        console.log('🎯 Using direct registration number query')
        const regQuery = q(coll(workingDb, "student-registrations"), w("registrationNumber", "==", searchTerm))
        const regSnapshot = await getDcs(regQuery)
        
        console.log(`📋 Direct query result: ${regSnapshot.size} documents`)
        
        regSnapshot.forEach((doc) => {
          const data = doc.data()
          const name = data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim()
          
          students.push({
            id: doc.id,
            registrationNumber: data.registrationNumber || data.studentIndexNumber || searchTerm,
            name,
            email: data.email || '',
            program: data.programme || data.program || '',
            level: data.currentLevel || data.entryLevel || data.level || '100',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || '',
            entryLevel: data.entryLevel || '100',
            currentLevel: data.currentLevel || data.entryLevel || data.level || '100',
            yearOfAdmission: data.yearOfAdmission || data.yearOfEntry || new Date().getFullYear(),
            profilePictureUrl: data.profilePictureUrl || ''
          })
          
          console.log(`✅ Found student via direct query: ${name} (${data.registrationNumber})`)
        })
      }
      
      // Method 2: If direct query fails, fall back to full collection scan
      if (students.length === 0) {
        console.log('🔍 Falling back to full collection scan')
        const registrationsSnapshot = await getDcs(coll(workingDb, "student-registrations"))
        console.log(`📋 Full scan: Found ${registrationsSnapshot.size} total records`)
        
        if (registrationsSnapshot.size === 0) {
          console.log('❌ No documents found in student-registrations collection')
        } else {
          registrationsSnapshot.docs.forEach((doc, index) => {
        console.log(`📄 Processing document ${index + 1}/${registrationsSnapshot.size}: ${doc.id}`)
        
        const data = doc.data()
        
        // Handle both test data and real student data formats
        const name = data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim()
        const regNumber = data.registrationNumber || data.studentIndexNumber || data.indexNumber || ''
        const email = data.email || ''
        const surname = data.surname || ''
        const otherNames = data.otherNames || ''
        
        console.log(`   📝 Document data: name="${name}", regNumber="${regNumber}", email="${email}"`)
        console.log(`   🔍 Checking against search term: "${searchTerm}"`)
        
        // More comprehensive search including individual name parts
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = name.toLowerCase().includes(searchLower) ||
                         surname.toLowerCase().includes(searchLower) ||
                         otherNames.toLowerCase().includes(searchLower)
        const regMatch = regNumber.toLowerCase().includes(searchLower)
        const emailMatch = email.toLowerCase().includes(searchLower)

        console.log(`   🎯 Match results: name=${nameMatch}, reg=${regMatch}, email=${emailMatch}`)

        if (nameMatch || regMatch || emailMatch) {
          console.log(`✅ Match found: ${name} (${regNumber})`)
          students.push({
            id: doc.id,
            registrationNumber: regNumber,
            name,
            email,
            program: data.programme || data.program || '',
            level: data.currentLevel || data.entryLevel || data.level || '100',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || '',
            entryLevel: data.entryLevel || '100',
            currentLevel: data.currentLevel || data.entryLevel || data.level || '100',
            yearOfAdmission: data.yearOfAdmission || data.yearOfEntry || new Date().getFullYear(),
            profilePictureUrl: data.profilePictureUrl || ''
          })
        }
          })
        }
      }
    } catch (error) {
      console.warn("Error searching student-registrations:", error)
    }

    // Search in students collection
    try {
      const studentsSnapshot = await getDocs(collection(db, "students"))
      console.log(`👥 Found ${studentsSnapshot.size} records in students collection`)
      
      studentsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        
        // Handle multiple name field formats for real vs test data
        const name = data.name || 
                     `${data.surname || ''} ${data.otherNames || ''}`.trim() ||
                     `${data.firstName || ''} ${data.lastName || ''}`.trim()
        const regNumber = data.registrationNumber || data.studentIndexNumber || data.indexNumber || ''
        const email = data.email || ''
        const surname = data.surname || data.lastName || ''
        const otherNames = data.otherNames || data.firstName || ''

        // Check if already found in registrations
        const alreadyExists = students.some(s => 
          s.registrationNumber === regNumber || 
          s.email === email ||
          s.id === doc.id
        )

        // Comprehensive search for real student data
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = name.toLowerCase().includes(searchLower) ||
                         surname.toLowerCase().includes(searchLower) ||
                         otherNames.toLowerCase().includes(searchLower)
        const regMatch = regNumber.toLowerCase().includes(searchLower)
        const emailMatch = email.toLowerCase().includes(searchLower)

        if (!alreadyExists && (nameMatch || regMatch || emailMatch)) {
          console.log(`✅ Match found in students: ${name} (${regNumber})`)
          students.push({
            id: doc.id,
            registrationNumber: regNumber,
            name,
            email,
            program: data.program || data.programme || '',
            level: data.level || data.currentLevel || '100',
            dateOfBirth: data.dateOfBirth || '',
            gender: data.gender || '',
            entryLevel: data.entryLevel || '100',
            currentLevel: data.currentLevel || data.level || '100',
            yearOfAdmission: data.yearOfAdmission || data.yearOfEntry || new Date().getFullYear(),
            profilePictureUrl: data.profilePictureUrl || ''
          })
        }
      })
    } catch (error) {
      console.warn("Error searching students:", error)
    }

    // Remove duplicates and limit results
    const uniqueStudents = students
      .filter((student, index, self) => 
        index === self.findIndex(s => 
          s.registrationNumber === student.registrationNumber || 
          s.email === student.email
        )
      )
      .slice(0, 20) // Limit to 20 results

    console.log(`🎯 Returning ${uniqueStudents.length} unique students`)
    
    if (uniqueStudents.length === 0) {
      console.log('❌ No students found matching search criteria')
      console.log('💡 Suggestion: Use the Test Data page to populate sample students')
    }

    return NextResponse.json(uniqueStudents)
  } catch (error) {
    console.error('Error searching students:', error)
    return NextResponse.json(
      { error: 'Failed to search students' },
      { status: 500 }
    )
  }
}
