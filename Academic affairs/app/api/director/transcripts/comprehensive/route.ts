import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface StudentInfo {
  id: string
  registrationNumber: string
  name: string
  email: string
  program: string
  level: string
  dateOfBirth: string
  gender: string
  entryLevel: string
  currentLevel: string
  yearOfAdmission: number
  profilePictureUrl: string
}

interface CourseResult {
  courseCode: string
  courseName: string
  credits: number
  assessment: number
  midsem: number
  exams: number
  total: number
  grade: string
  gradePoint: number
  status: 'completed' | 'in_progress' | 'registered'
}

interface SemesterResult {
  academicYear: string
  semester: string
  courses: CourseResult[]
  totalCredits: number
  completedCredits: number
  totalGradePoints: number
  semesterGPA: number
  coursesInProgress: number
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

// Grade point mapping
const getGradePoint = (grade: string): number => {
  const gradePoints: { [key: string]: number } = {
    "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0
  }
  return gradePoints[grade] || 0.0
}

// Class standing based on GPA
const getClassStanding = (gpa: number): string => {
  if (gpa >= 3.6) return "First Class"
  if (gpa >= 3.0) return "Second Class Upper"
  if (gpa >= 2.0) return "Second Class Lower"
  if (gpa >= 1.0) return "Third Class"
  return "Pass"
}

// Academic status based on GPA
const getAcademicStatus = (gpa: number): string => {
  if (gpa >= 3.0) return "Good Standing"
  if (gpa >= 2.0) return "Satisfactory"
  return "Probation"
}

// Normalize semester names
const normalizeSemester = (semester: string): string => {
  if (!semester) return 'First'
  const lower = semester.toLowerCase()
  if (lower.includes('1') || lower.includes('first')) return 'First'
  if (lower.includes('2') || lower.includes('second')) return 'Second'
  return semester
}

// Get comprehensive student information
const getStudentInfo = async (studentId: string): Promise<StudentInfo | null> => {
  try {
    console.log(`🔍 Looking for student: ${studentId}`)
    
    // Try student-registrations first (primary source)
    let studentDoc = await getDoc(doc(db, "student-registrations", studentId))
    
    if (studentDoc.exists()) {
      console.log(`✅ Found student in student-registrations`)
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

    // Try students collection as backup
    studentDoc = await getDoc(doc(db, "students", studentId))
    
    if (studentDoc.exists()) {
      console.log(`✅ Found student in students collection`)
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

    // Try searching by registration number
    if (studentId.includes('UCAES')) {
      console.log(`🔍 Searching by registration number: ${studentId}`)
      const regQuery = query(
        collection(db, "student-registrations"), 
        where("registrationNumber", "==", studentId)
      )
      const regSnapshot = await getDocs(regQuery)
      
      if (!regSnapshot.empty) {
        console.log(`✅ Found by registration number search`)
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

    console.log(`❌ Student not found: ${studentId}`)
    return null
  } catch (error) {
    console.error("Error getting student info:", error)
    return null
  }
}

// Generate comprehensive academic transcript from all student data
const generateComprehensiveTranscript = async (studentId: string, studentEmail?: string): Promise<SemesterResult[]> => {
  try {
    console.log(`🎓 Generating comprehensive transcript for: ${studentId}`)
    
    // Step 1: Get ALL course registrations for this student
    let courseRegistrations: any[] = []
    
    const registrationSearches = [
      { field: "studentId", value: studentId },
      { field: "email", value: studentEmail },
      { field: "registrationNumber", value: studentId }
    ]
    
    for (const search of registrationSearches) {
      if (!search.value) continue
      
      try {
        const regQuery = query(
          collection(db, "course-registrations"),
          where(search.field, "==", search.value)
        )
        const regSnapshot = await getDocs(regQuery)
        regSnapshot.docs.forEach(doc => {
          const regData = { id: doc.id, ...doc.data() }
          if (!courseRegistrations.some(r => r.id === regData.id)) {
            courseRegistrations.push(regData)
          }
        })
        console.log(`📋 Found ${regSnapshot.size} course registrations by ${search.field}`)
      } catch (error) {
        console.warn(`Error searching course registrations by ${search.field}:`, error)
      }
    }
    
    console.log(`📚 Total course registrations found: ${courseRegistrations.length}`)
    
    // Step 2: Get ALL published grades for this student
    let allGrades: any[] = []
    
    const gradeSearches = [
      { field: "studentId", value: studentId, collection: "student-grades" },
      { field: "studentId", value: studentEmail, collection: "student-grades" },
      { field: "studentId", value: studentId, collection: "grades" },
      { field: "studentId", value: studentEmail, collection: "grades" },
    ]

    for (const search of gradeSearches) {
      if (!search.value) continue
      
      try {
        const gradeQuery = query(
          collection(db, search.collection),
          where(search.field, "==", search.value),
          where("status", "==", "published")
        )
        const gradeSnapshot = await getDocs(gradeQuery)
        gradeSnapshot.docs.forEach(doc => {
          const gradeData = { id: doc.id, ...doc.data() }
          if (!allGrades.some(g => g.id === gradeData.id)) {
            allGrades.push(gradeData)
          }
        })
        console.log(`📊 Found ${gradeSnapshot.size} published grades in ${search.collection}`)
      } catch (error) {
        console.warn(`Error searching ${search.collection}:`, error)
      }
    }
    
    console.log(`🎯 Total published grades found: ${allGrades.length}`)
    
    // Step 3: Create comprehensive academic periods
    const academicPeriods = new Map<string, any>()
    
    // Process course registrations to establish academic periods
    courseRegistrations.forEach(registration => {
      const academicYear = registration.academicYear || '2026-2027'
      const semester = normalizeSemester(registration.semester || '1')
      const key = `${academicYear}-${semester}`
      
      if (!academicPeriods.has(key)) {
        academicPeriods.set(key, {
          academicYear,
          semester,
          courses: [],
          registeredCourses: []
        })
      }
      
      // Add registered courses
      if (registration.courses && Array.isArray(registration.courses)) {
        registration.courses.forEach(course => {
          academicPeriods.get(key).registeredCourses.push({
            courseCode: course.courseCode || course.code,
            courseName: course.courseName || course.name || course.title,
            credits: course.credits || 3,
            status: 'registered'
          })
        })
      }
    })
    
    // Process grades to add completed courses
    allGrades.forEach(gradeDoc => {
      const grade = gradeDoc
      const academicYear = grade.academicYear || '2026-2027'
      const semester = normalizeSemester(grade.semester || '1')
      const key = `${academicYear}-${semester}`
      
      if (!academicPeriods.has(key)) {
        academicPeriods.set(key, {
          academicYear,
          semester,
          courses: [],
          registeredCourses: []
        })
      }
      
      // Add graded course
      academicPeriods.get(key).courses.push({
        courseCode: grade.courseCode || grade.courseId,
        courseName: grade.courseName || grade.courseTitle || grade.courseCode,
        credits: grade.credits || 3,
        assessment: grade.assessment || 0,
        midsem: grade.midsem || grade.midTerm || 0,
        exams: grade.exams || grade.finalExam || 0,
        total: grade.total || 0,
        grade: grade.grade || 'F',
        gradePoint: grade.gradePoint || getGradePoint(grade.grade || 'F'),
        status: 'completed'
      })
    })
    
    // Merge registered courses with grades
    academicPeriods.forEach((period, key) => {
      period.registeredCourses.forEach(regCourse => {
        const hasGrade = period.courses.some(gradedCourse => 
          gradedCourse.courseCode === regCourse.courseCode
        )
        
        if (!hasGrade) {
          period.courses.push({
            ...regCourse,
            assessment: 0,
            midsem: 0,
            exams: 0,
            total: 0,
            grade: 'IP', // In Progress
            gradePoint: 0,
            status: 'in_progress'
          })
        }
      })
    })
    
    // Convert to SemesterResult format
    const semesterResults: SemesterResult[] = []
    
    academicPeriods.forEach((period, key) => {
      if (period.courses.length === 0) return
      
      const totalCredits = period.courses.reduce((sum, course) => sum + course.credits, 0)
      const completedCourses = period.courses.filter(course => course.status === 'completed')
      const totalGradePoints = completedCourses.reduce((sum, course) => sum + (course.credits * course.gradePoint), 0)
      const completedCredits = completedCourses.reduce((sum, course) => sum + course.credits, 0)
      const semesterGPA = completedCredits > 0 ? totalGradePoints / completedCredits : 0

      semesterResults.push({
        academicYear: period.academicYear,
        semester: period.semester,
        courses: period.courses,
        totalCredits,
        completedCredits,
        totalGradePoints,
        semesterGPA,
        coursesInProgress: period.courses.filter(c => c.status === 'in_progress').length
      })
    })
    
    // Sort by academic year and semester
    semesterResults.sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return a.academicYear.localeCompare(b.academicYear)
      }
      const getSemesterOrder = (sem: string) => {
        if (sem.includes('1') || sem.toLowerCase().includes('first')) return 1
        if (sem.includes('2') || sem.toLowerCase().includes('second')) return 2
        return 1
      }
      return getSemesterOrder(a.semester) - getSemesterOrder(b.semester)
    })
    
    console.log(`✅ Generated comprehensive transcript with ${semesterResults.length} academic periods`)
    
    return semesterResults
  } catch (error) {
    console.error("Error generating comprehensive transcript:", error)
    return []
  }
}

// GET: Generate comprehensive transcript for a specific student
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

    console.log(`🎓 Generating comprehensive transcript for: ${studentId}`)

    // Get student information
    const student = await getStudentInfo(studentId)
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    console.log(`👤 Student found: ${student.name} (${student.registrationNumber})`)

    // Generate comprehensive transcript
    const semesters = await generateComprehensiveTranscript(studentId, student.email)

    // Calculate summary statistics
    const totalCreditsAttempted = semesters.reduce((sum, sem) => sum + sem.totalCredits, 0)
    const totalCreditsEarned = semesters.reduce((sum, sem) => sum + sem.completedCredits, 0)
    const totalGradePoints = semesters.reduce((sum, sem) => sum + sem.totalGradePoints, 0)
    const cumulativeGPA = totalCreditsEarned > 0 ? totalGradePoints / totalCreditsEarned : 0

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

    console.log(`📊 Transcript Summary: ${totalCreditsEarned}/${totalCreditsAttempted} credits, GPA: ${cumulativeGPA.toFixed(2)}`)

    return NextResponse.json(transcriptData)
  } catch (error) {
    console.error('Error generating comprehensive transcript:', error)
    return NextResponse.json(
      { error: 'Failed to generate transcript' },
      { status: 500 }
    )
  }
}

// POST: Search for students (comprehensive search)
export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json()

    console.log(`🔍 Comprehensive student search for: "${searchTerm}"`)

    if (!searchTerm || searchTerm.length < 2) {
      console.log('❌ Search term too short or empty')
      return NextResponse.json([])
    }

    let students: StudentInfo[] = []

    // Search in student-registrations (primary source)
    try {
      console.log(`🔍 Searching student-registrations...`)
      const registrationsSnapshot = await getDocs(collection(db, "student-registrations"))
      console.log(`📋 Found ${registrationsSnapshot.size} records in student-registrations`)
      
      registrationsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        
        const name = data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim()
        const regNumber = data.registrationNumber || data.studentIndexNumber || data.indexNumber || ''
        const email = data.email || ''
        const surname = data.surname || ''
        const otherNames = data.otherNames || ''
        
        console.log(`   📄 Checking: ${name} (${regNumber})`)
        
        const searchLower = searchTerm.toLowerCase()
        const nameMatch = name.toLowerCase().includes(searchLower) ||
                         surname.toLowerCase().includes(searchLower) ||
                         otherNames.toLowerCase().includes(searchLower)
        const regMatch = regNumber.toLowerCase().includes(searchLower)
        const emailMatch = email.toLowerCase().includes(searchLower)

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
    } catch (error) {
      console.warn("Error searching student-registrations:", error)
    }

    console.log(`🎯 Found ${students.length} matching students`)

    return NextResponse.json(students.slice(0, 20)) // Limit to 20 results
  } catch (error) {
    console.error('Error searching students:', error)
    return NextResponse.json(
      { error: 'Failed to search students' },
      { status: 500 }
    )
  }
}














