// Firebase configuration and utilities
import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import type { User, Course, Student, Registration, Grade, Announcement, AuditLog } from "./types"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  databaseURL: "https://collage-of-agricuture-default-rtdb.firebaseio.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// Initialize Analytics (only in browser environment)
let analytics
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}
export { analytics }

// Collection references
export const collections = {
  users: "users",
  courses: "courses",
  students: "students",
  registrations: "registrations",
  grades: "grades",
  announcements: "announcements",
  auditLogs: "auditLogs",
}

// Firebase service functions
export class FirebaseService {
  // User operations
  static async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser
    if (!user) return null

    const userDoc = await getDoc(doc(db, collections.users, user.uid))
    return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as User) : null
  }

  // Course operations
  static async getLecturerCourses(lecturerId: string): Promise<Course[]> {
    const q = query(collection(db, collections.courses), where("lecturerId", "==", lecturerId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Course)
  }

  // Student operations
  static async getStudentsForCourse(courseId: string): Promise<(Student & { registrationId: string })[]> {
    const registrationsQuery = query(
      collection(db, collections.registrations),
      where("courseId", "==", courseId),
      where("status", "==", "Active"),
    )

    const registrations = await getDocs(registrationsQuery)
    const students: (Student & { registrationId: string })[] = []

    for (const regDoc of registrations.docs) {
      const registration = regDoc.data() as Registration
      const studentDoc = await getDoc(doc(db, collections.students, registration.studentId))

      if (studentDoc.exists()) {
        students.push({
          id: studentDoc.id,
          ...(studentDoc.data() as Student),
          registrationId: regDoc.id,
        })
      }
    }

    return students
  }

  // Grade operations
  static async submitGrades(grades: Omit<Grade, "id" | "submittedAt">[]): Promise<void> {
    const batch = grades.map((grade) =>
      addDoc(collection(db, collections.grades), {
        ...grade,
        submittedAt: Timestamp.now().toDate().toISOString(),
      }),
    )

    await Promise.all(batch)

    // Log the action
    await this.logAction(
      grades[0].lecturerId,
      "Grade Submission",
      `Submitted grades for ${grades.length} students in course ${grades[0].courseId}`,
    )
  }

  static async getPendingGrades(lecturerId: string): Promise<Grade[]> {
    const q = query(
      collection(db, collections.grades),
      where("lecturerId", "==", lecturerId),
      where("status", "==", "pending"),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Grade)
  }

  // Announcement operations
  static async getAnnouncements(): Promise<Announcement[]> {
    const q = query(
      collection(db, collections.announcements),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(10),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Announcement)
  }

  static async createAnnouncement(announcement: Omit<Announcement, "id" | "createdAt">): Promise<void> {
    await addDoc(collection(db, collections.announcements), {
      ...announcement,
      createdAt: Timestamp.now().toDate().toISOString(),
    })

    await this.logAction(announcement.authorId, "Announcement Created", `Created announcement: ${announcement.title}`)
  }

  // Audit log operations
  static async logAction(userId: string, action: string, details: string): Promise<void> {
    await addDoc(collection(db, collections.auditLogs), {
      userId,
      userName: "Current User", // This should be fetched from user context
      action,
      details,
      timestamp: Timestamp.now().toDate().toISOString(),
    })
  }

  static async getRecentActivity(userId: string, limitCount = 5): Promise<AuditLog[]> {
    const q = query(
      collection(db, collections.auditLogs),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuditLog)
  }

  // Real-time listeners
  static subscribeToGrades(lecturerId: string, callback: (grades: Grade[]) => void) {
    const q = query(collection(db, collections.grades), where("lecturerId", "==", lecturerId))

    return onSnapshot(q, (snapshot) => {
      const grades = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Grade)
      callback(grades)
    })
  }
}

// Authentication helpers
export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)

export const signOutUser = () => signOut(auth)

export const onAuthChange = (callback: (user: any) => void) => onAuthStateChanged(auth, callback)
