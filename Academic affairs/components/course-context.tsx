"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { COLLEGE_PROGRAMS } from "@/lib/programs-db"
import { useFirebaseData } from "@/hooks/use-firebase-data"
import { CoursesService, type Course as CourseType } from "@/lib/firebase-service"

export interface Course {
  id: string
  code: string
  title: string
  description: string
  credits: number
  level: number
  department: string
  prerequisites: string[]
  programId?: string
  registrationStatus: "open" | "closed" | "pending"
  semester: string
  yearOffered: string
  staffAssigned: string[]
  enrollmentLimit: number
  enrolledStudents: number
  waitlistCount: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt?: string
}

export interface CourseEnrollment {
  id: string
  courseId: string
  studentId: string
  studentName: string
  enrollmentDate: string
  status: "enrolled" | "waitlisted" | "dropped" | "completed"
  grade?: string
  paymentStatus: "paid" | "pending" | "waived"
  createdAt: string
  updatedAt?: string
}

export interface CourseSchedule {
  id: string
  courseId: string
  day: string
  startTime: string
  endTime: string
  room: string
  building: string
  instructorId: string
  instructorName: string
  type: "lecture" | "lab" | "tutorial"
  createdAt: string
}

interface CourseContextType {
  courses: Course[]
  enrollments: CourseEnrollment[]
  schedules: CourseSchedule[]
  loading: boolean

  // Course Management
  addCourse: (course: Omit<Course, "id" | "createdAt">) => Promise<void>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  getCoursesByProgram: (programId: string) => Course[]
  getCoursesByInstructor: (instructorId: string) => Course[]

  // Enrollment Management
  enrollStudent: (courseId: string, studentId: string, studentName: string) => Promise<void>
  dropStudent: (enrollmentId: string) => Promise<void>
  updateEnrollmentStatus: (enrollmentId: string, status: CourseEnrollment["status"]) => Promise<void>
  updateGrade: (enrollmentId: string, grade: string) => Promise<void>
  getEnrollmentsByCourse: (courseId: string) => CourseEnrollment[]
  getEnrollmentsByStudent: (studentId: string) => CourseEnrollment[]

  // Schedule Management
  addSchedule: (schedule: Omit<CourseSchedule, "id" | "createdAt">) => Promise<void>
  updateSchedule: (id: string, schedule: Partial<CourseSchedule>) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  getSchedulesByCourse: (courseId: string) => CourseSchedule[]
  getSchedulesByInstructor: (instructorId: string) => CourseSchedule[]
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [schedules, setSchedules] = useState<CourseSchedule[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch Firebase data
  const { data: firebaseCourses, loading: coursesLoading } = useFirebaseData<CourseType>(
    'academic-courses',
    { orderBy: [['code', 'asc']] }
  )
  
  // Transform Firebase data to context format
  useEffect(() => {
    if (firebaseCourses) {
      const transformedCourses: Course[] = firebaseCourses.map(course => ({
        id: course.id || '',
        code: course.code,
        title: course.title,
        description: course.description || '',
        credits: course.credits,
        level: course.level,
        department: course.department,
        prerequisites: course.prerequisites || [],
        programId: course.programId,
        registrationStatus: 'open', // Default value since Firebase doesn't store this
        semester: course.semester ? String(course.semester) : '1',
        yearOffered: new Date().getFullYear().toString(),
        staffAssigned: [],
        enrollmentLimit: 50, // Default value
        enrolledStudents: 0, // Default value
        waitlistCount: 0, // Default value
        status: course.status,
        createdAt: course.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: course.updatedAt?.toDate?.()?.toISOString()
      }))
      
      setCourses(transformedCourses)
    }
  }, [firebaseCourses])

  // For now, these are stub implementations - would be replaced with Firebase queries
  useEffect(() => {
    // Mock data for enrollments and schedules
    if (courses.length > 0 && !enrollments.length) {
      // Generate some mock enrollments based on actual courses
      const mockEnrollments: CourseEnrollment[] = []
      const mockSchedules: CourseSchedule[] = []
      
      courses.forEach((course) => {
        // Add mock enrollments
        for (let i = 1; i <= 5; i++) {
          mockEnrollments.push({
            id: `enrollment-${course.id}-${i}`,
            courseId: course.id,
            studentId: `S00${i}`,
            studentName: `Student ${i}`,
            enrollmentDate: new Date().toISOString(),
            status: "enrolled",
            paymentStatus: "paid",
            createdAt: new Date().toISOString(),
          })
        }
        
        // Add mock schedules
        mockSchedules.push({
          id: `schedule-${course.id}-1`,
          courseId: course.id,
          day: "Monday",
          startTime: "09:00",
          endTime: "11:00",
          room: "101",
          building: "Main Building",
          instructorId: "STAFF001",
          instructorName: "Prof. Michael Chen",
          type: "lecture",
          createdAt: new Date().toISOString(),
        })
      })
      
      setEnrollments(mockEnrollments)
      setSchedules(mockSchedules)
    }
  }, [courses, enrollments.length])

  // Track loading state
  useEffect(() => {
    setLoading(coursesLoading)
  }, [coursesLoading])

  const addCourse = async (courseData: Omit<Course, "id" | "createdAt">) => {
    try {
      const firebaseCourse: CourseType = {
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        credits: courseData.credits,
        level: courseData.level,
        semester: parseInt(courseData.semester, 10),
        department: courseData.department,
        prerequisites: courseData.prerequisites,
        programId: courseData.programId,
        status: courseData.status
      }
      
      await CoursesService.create(firebaseCourse)
    } catch (error) {
      console.error('Error adding course:', error)
      throw error
    }
  }

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      // Transform to Firebase format
      const firebaseCourseData: Partial<CourseType> = {
        ...(courseData.code && { code: courseData.code }),
        ...(courseData.title && { title: courseData.title }),
        ...(courseData.description && { description: courseData.description }),
        ...(courseData.credits !== undefined && { credits: courseData.credits }),
        ...(courseData.level !== undefined && { level: courseData.level }),
        ...(courseData.semester && { semester: parseInt(courseData.semester, 10) }),
        ...(courseData.department && { department: courseData.department }),
        ...(courseData.prerequisites && { prerequisites: courseData.prerequisites }),
        ...(courseData.programId && { programId: courseData.programId }),
        ...(courseData.status && { status: courseData.status })
      }
      
      await CoursesService.update(id, firebaseCourseData)
      
      // Update local state
      setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, ...courseData } : course)))
    } catch (error) {
      console.error('Error updating course:', error)
      throw error
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      await CoursesService.delete(id)
      
      // Update local state
      setCourses((prev) => prev.filter((course) => course.id !== id))
    } catch (error) {
      console.error('Error deleting course:', error)
      throw error
    }
  }

  const getCoursesByProgram = (programId: string) => {
    return courses.filter((course) => course.programId === programId)
  }

  const getCoursesByInstructor = (instructorId: string) => {
    // Find schedules with this instructor
    const instructorSchedules = schedules.filter(
      (schedule) => schedule.instructorId === instructorId
    )
    
    // Get course IDs from those schedules
    const courseIds = instructorSchedules.map(
      (schedule) => schedule.courseId
    )
    
    // Filter courses by those IDs
    return courses.filter((course) => courseIds.includes(course.id))
  }

  // For now, these are stub implementations using local state
  // These would also be migrated to Firebase in a complete implementation
  const enrollStudent = async (courseId: string, studentId: string, studentName: string) => {
    const newEnrollment: CourseEnrollment = {
      id: `enrollment-${Date.now()}`,
      courseId,
      studentId,
      studentName,
      enrollmentDate: new Date().toISOString(),
      status: "enrolled",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    }
    
    setEnrollments((prev) => [...prev, newEnrollment])
    
    // Update enrolled count
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, enrolledStudents: course.enrolledStudents + 1 }
          : course
      )
    )
  }

  const dropStudent = async (enrollmentId: string) => {
    const enrollment = enrollments.find(
      (enrollment) => enrollment.id === enrollmentId
    )
    
    if (!enrollment) return
    
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId ? { ...e, status: "dropped" } : e
      )
    )
    
    // Update enrolled count
    setCourses((prev) =>
      prev.map((course) =>
        course.id === enrollment.courseId
          ? { ...course, enrolledStudents: course.enrolledStudents - 1 }
          : course
      )
    )
  }

  const updateEnrollmentStatus = async (enrollmentId: string, status: CourseEnrollment["status"]) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, status } : e))
    )
  }

  const updateGrade = async (enrollmentId: string, grade: string) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, grade } : e))
    )
  }

  const getEnrollmentsByCourse = (courseId: string) => {
    return enrollments.filter(
      (enrollment) => enrollment.courseId === courseId
    )
  }

  const getEnrollmentsByStudent = (studentId: string) => {
    return enrollments.filter(
      (enrollment) => enrollment.studentId === studentId
    )
  }

  const addSchedule = async (scheduleData: Omit<CourseSchedule, "id" | "createdAt">) => {
    const newSchedule: CourseSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    
    setSchedules((prev) => [...prev, newSchedule])
  }

  const updateSchedule = async (id: string, scheduleData: Partial<CourseSchedule>) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, ...scheduleData } : schedule
      )
    )
  }

  const deleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
  }

  const getSchedulesByCourse = (courseId: string) => {
    return schedules.filter((schedule) => schedule.courseId === courseId)
  }

  const getSchedulesByInstructor = (instructorId: string) => {
    return schedules.filter(
      (schedule) => schedule.instructorId === instructorId
    )
  }

  return (
    <CourseContext.Provider
      value={{
        courses,
        enrollments,
        schedules,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        getCoursesByProgram,
        getCoursesByInstructor,
        enrollStudent,
        dropStudent,
        updateEnrollmentStatus,
        updateGrade,
        getEnrollmentsByCourse,
        getEnrollmentsByStudent,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getSchedulesByCourse,
        getSchedulesByInstructor,
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourses() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error("useCourses must be used within a CourseProvider")
  }
  return context
}
