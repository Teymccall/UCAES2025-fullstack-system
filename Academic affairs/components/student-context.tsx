"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, getDocs, doc, setDoc, updateDoc, query, where, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Student {
  id: string
  studentId: string
  name: string
  email: string
  program: string
  level: string
  semester: string
  enrolledCourses: string[]
  gpa: number
  cgpa: number
  status: "active" | "inactive" | "graduated"
  createdAt: string
}

export interface StudentResult {
  id: string
  studentId: string
  courseId: string
  courseCode: string
  courseName: string
  midterm: number | null
  final: number | null
  assignments: number | null
  total: number
  grade: string
  status: "draft" | "submitted" | "approved" | "rejected"
  submittedBy: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  comments?: string
}

export interface AuditLog {
  id: string
  action: string
  performedBy: string
  performedByRole: string
  targetStudentId: string
  details: string
  timestamp: string
}

export interface CourseEnrollment {
  id: string
  studentId: string
  courseId: string
  courseCode: string
  enrollmentDate: string
  enrolledBy: string
  status: "active" | "dropped" | "completed" | "failed"
  grade?: string
  completionDate?: string
}

interface StudentContextType {
  students: Student[]
  results: StudentResult[]
  auditLogs: AuditLog[]
  courseEnrollments: CourseEnrollment[]
  addStudent: (student: Omit<Student, "id" | "createdAt">) => void
  updateStudent: (id: string, student: Partial<Student>) => void
  getStudentsByCourse: (courseCode: string) => Student[]
  saveResultDraft: (result: Omit<StudentResult, "id">) => void
  submitResults: (courseCode: string, staffId: string) => void
  getResultsByCourse: (courseCode: string) => StudentResult[]
  calculateGrade: (total: number) => string
  searchStudents: (query: string) => Student[]
  addCourseToStudent: (studentId: string, courseCode: string) => boolean
  removeCourseFromStudent: (studentId: string, courseCode: string) => boolean
  validateCoursePrerequisites: (studentId: string, courseCode: string) => { valid: boolean; missingPrereqs: string[] }
  getStudentByIndex: (studentId: string) => Student | undefined
  getStudentsByName: (name: string) => Student[]
  updateStudentInfo: (id: string, updates: Partial<Student>) => void
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => void
  getStudentAuditHistory: (studentId: string) => AuditLog[]
  validateEnrollmentCapacity: (courseCode: string) => { canEnroll: boolean; currentCount: number; maxCapacity: number }
  getStudentAcademicHistory: (studentId: string) => CourseEnrollment[]
  validateStaffCourseAccess: (staffId: string, courseCode: string) => boolean
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [results, setResults] = useState<StudentResult[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, "students"))
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[]
        setStudents(studentsData)

        const resultsSnapshot = await getDocs(collection(db, "results"))
        const resultsData = resultsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudentResult[]
        setResults(resultsData)

        const auditLogsSnapshot = await getDocs(collection(db, "auditLogs"))
        const auditLogsData = auditLogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AuditLog[]
        setAuditLogs(auditLogsData)

        const enrollmentsSnapshot = await getDocs(collection(db, "courseEnrollments"))
        const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CourseEnrollment[]
        setCourseEnrollments(enrollmentsData)
      } catch (error) {
        console.error("Error fetching data from Firestore:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const addStudent = async (studentData: Omit<Student, "id" | "createdAt">) => {
    try {
      const newStudent: Omit<Student, "id"> = {
        ...studentData,
        createdAt: new Date().toISOString(),
      }
      
      const docRef = await addDoc(collection(db, "students"), newStudent)
      
      const addedStudent: Student = {
        id: docRef.id,
        ...newStudent
      }
      
      setStudents(prev => [...prev, addedStudent])
    } catch (error) {
      console.error("Error adding student to Firestore:", error)
    }
  }

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const studentRef = doc(db, "students", id)
      await updateDoc(studentRef, {
        ...studentData,
        updatedAt: new Date().toISOString()
      })
      
      setStudents(prev => prev.map(student => 
        student.id === id ? { ...student, ...studentData } : student
      ))
    } catch (error) {
      console.error("Error updating student in Firestore:", error)
    }
  }

  const getStudentsByCourse = (courseCode: string) => {
    return students.filter((student) => Array.isArray(student.enrolledCourses) && student.enrolledCourses.includes(courseCode))
  }

  const calculateGrade = (total: number) => {
    if (total >= 90) return "A"
    if (total >= 85) return "A-"
    if (total >= 80) return "B+"
    if (total >= 75) return "B"
    if (total >= 70) return "B-"
    if (total >= 65) return "C+"
    if (total >= 60) return "C"
    if (total >= 55) return "C-"
    if (total >= 50) return "D"
    return "F"
  }

  const saveResultDraft = async (resultData: Omit<StudentResult, "id">) => {
    try {
      const existingIndex = results.findIndex(
        (r) => r.studentId === resultData.studentId && r.courseCode === resultData.courseCode,
      )

      if (existingIndex >= 0) {
        // Update existing result
        const resultId = results[existingIndex].id
        const resultRef = doc(db, "results", resultId)
        await updateDoc(resultRef, {
          ...resultData,
          updatedAt: new Date().toISOString()
        })
        
        const updatedResult: StudentResult = {
          ...resultData,
          id: resultId
        }
        
        setResults(prev => prev.map((result, index) => 
          index === existingIndex ? updatedResult : result
        ))
      } else {
        // Create new result
        const docRef = await addDoc(collection(db, "results"), {
          ...resultData,
          createdAt: new Date().toISOString()
        })
        
        const newResult: StudentResult = {
          ...resultData,
          id: docRef.id
        }
        
        setResults(prev => [...prev, newResult])
      }
    } catch (error) {
      console.error("Error saving result draft to Firestore:", error)
    }
  }

  const submitResults = async (courseCode: string, staffId: string) => {
    try {
      const courseResults = results.filter(r => r.courseCode === courseCode && r.submittedBy === staffId)
      
      for (const result of courseResults) {
        const resultRef = doc(db, "results", result.id)
        await updateDoc(resultRef, {
          status: "submitted",
          submittedAt: new Date().toISOString()
        })
      }
      
      setResults(prev =>
        prev.map(result =>
          result.courseCode === courseCode && result.submittedBy === staffId
            ? { ...result, status: "submitted", submittedAt: new Date().toISOString() }
            : result
        )
      )
    } catch (error) {
      console.error("Error submitting results to Firestore:", error)
    }
  }

  const getResultsByCourse = (courseCode: string) => {
    return results.filter((result) => result.courseCode === courseCode)
  }

  const searchStudents = (query: string) => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    return students.filter(
      (student) => student && (
        (student.studentId && student.studentId.toLowerCase().includes(lowerQuery)) ||
        (student.name && student.name.toLowerCase().includes(lowerQuery)) ||
        (student.email && student.email.toLowerCase().includes(lowerQuery))
      )
    );
  }

  const addCourseToStudent = async (studentId: string, courseCode: string): Promise<boolean> => {
    try {
      const student = students.find((s) => s.studentId === studentId)
      if (!student) return false

      if (student.enrolledCourses.includes(courseCode)) {
        return false // Already enrolled
      }

      const updatedCourses = [...student.enrolledCourses, courseCode]
      
      const studentRef = doc(db, "students", student.id)
      await updateDoc(studentRef, {
        enrolledCourses: updatedCourses,
        updatedAt: new Date().toISOString()
      })

      setStudents(prev =>
        prev.map(s => (s.studentId === studentId ? 
          { ...s, enrolledCourses: updatedCourses } : s
        ))
      )
      
      return true
    } catch (error) {
      console.error("Error adding course to student in Firestore:", error)
      return false
    }
  }

  const removeCourseFromStudent = async (studentId: string, courseCode: string): Promise<boolean> => {
    try {
      const student = students.find((s) => s.studentId === studentId)
      if (!student) return false

      const updatedCourses = student.enrolledCourses.filter(c => c !== courseCode)
      
      const studentRef = doc(db, "students", student.id)
      await updateDoc(studentRef, {
        enrolledCourses: updatedCourses,
        updatedAt: new Date().toISOString()
      })

      setStudents(prev =>
        prev.map(s =>
          s.studentId === studentId ? 
            { ...s, enrolledCourses: updatedCourses } : s
        )
      )
      
      return true
    } catch (error) {
      console.error("Error removing course from student in Firestore:", error)
      return false
    }
  }

  const validateCoursePrerequisites = (studentId: string, courseCode: string) => {
    const student = students.find((s) => s.studentId === studentId)
    if (!student) return { valid: false, missingPrereqs: [] }

    // This would typically check against course prerequisites
    // For now, we'll use a simple mock validation
    const missingPrereqs: string[] = []

    // Mock prerequisite checking
    if (courseCode === "CS 301" && !(Array.isArray(student.enrolledCourses) && student.enrolledCourses.includes("CS 201"))) {
      missingPrereqs.push("CS 201")
    }
    if (courseCode === "CS 201" && !(Array.isArray(student.enrolledCourses) && student.enrolledCourses.includes("CS 101"))) {
      missingPrereqs.push("CS 101")
    }

    return { valid: missingPrereqs.length === 0, missingPrereqs }
  }

  const getStudentByIndex = (studentId: string) => {
    return students.find((s) => s.studentId === studentId)
  }

  const getStudentsByName = (name: string) => {
    const lowerName = name.toLowerCase()
    return students.filter((s) => s.name.toLowerCase().includes(lowerName))
  }

  const updateStudentInfo = async (id: string, updates: Partial<Student>) => {
    try {
      const studentRef = doc(db, "students", id)
      await updateDoc(studentRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      setStudents(prev => prev.map(student => 
        student.id === id ? { ...student, ...updates } : student
      ))
    } catch (error) {
      console.error("Error updating student info in Firestore:", error)
    }
  }

  const addAuditLog = async (logData: Omit<AuditLog, "id" | "timestamp">) => {
    try {
      const newLog: Omit<AuditLog, "id"> = {
        ...logData,
        timestamp: new Date().toISOString(),
      }
      
      const docRef = await addDoc(collection(db, "auditLogs"), newLog)
      
      const addedLog: AuditLog = {
        ...newLog,
        id: docRef.id,
      }
      
      setAuditLogs(prev => [...prev, addedLog])
    } catch (error) {
      console.error("Error adding audit log to Firestore:", error)
    }
  }

  const getStudentAuditHistory = (studentId: string) => {
    return auditLogs.filter((log) => log.targetStudentId === studentId)
  }

  const validateEnrollmentCapacity = (courseCode: string) => {
    // Mock implementation
    const maxCapacity = 30
    const currentCount = students.filter((student) => Array.isArray(student.enrolledCourses) && student.enrolledCourses.includes(courseCode)).length
    return { canEnroll: currentCount < maxCapacity, currentCount, maxCapacity }
  }

  const getStudentAcademicHistory = (studentId: string) => {
    return courseEnrollments.filter((enrollment) => enrollment.studentId === studentId)
  }

  const validateStaffCourseAccess = (staffId: string, courseCode: string): boolean => {
    // Mock implementation: Check if staffId has access to courseCode
    // In a real application, this would likely involve checking against a database or access control list
    return true // Assume all staff have access for now
  }

  // Show loading state
  if (loading) {
    return <div>Loading student data...</div>
  }

  return (
    <StudentContext.Provider
      value={{
        students,
        results,
        auditLogs,
        courseEnrollments,
        addStudent,
        updateStudent,
        getStudentsByCourse,
        saveResultDraft,
        submitResults,
        getResultsByCourse,
        calculateGrade,
        searchStudents,
        addCourseToStudent,
        removeCourseFromStudent,
        validateCoursePrerequisites,
        getStudentByIndex,
        getStudentsByName,
        updateStudentInfo,
        addAuditLog,
        getStudentAuditHistory,
        validateEnrollmentCapacity,
        getStudentAcademicHistory,
        validateStaffCourseAccess,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudents() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudents must be used within a StudentProvider")
  }
  return context
}
