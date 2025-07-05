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
    const q = query(
      collection(db, "grades"),
      where("studentId", "==", studentId),
      orderBy("academicYear", "desc"),
      orderBy("semester", "desc"),
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SemesterResult[]
  } catch (error) {
    console.error("Error getting student grades:", error)
    throw error
  }
}

export const getGradesByYearAndSemester = async (
  studentId: string,
  academicYear: string,
  semester: string,
): Promise<SemesterResult | null> => {
  try {
    const q = query(
      collection(db, "grades"),
      where("studentId", "==", studentId),
      where("academicYear", "==", academicYear),
      where("semester", "==", semester),
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as SemesterResult
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting grades by year and semester:", error)
    throw error
  }
}

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
    const q = query(
      collection(db, "registrations"),
      where("studentId", "==", studentId),
      orderBy("academicYear", "desc"),
      orderBy("semester", "desc"),
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CourseRegistration[]
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
