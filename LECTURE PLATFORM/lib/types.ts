// Core Types for the Lecturer Portal
export interface User {
  id: string
  name: string
  email: string
  role: "Lecturer" | "Admin" | "Student"
  assignedCourses?: string[]
  department?: string
  profileImage?: string
}

export interface Course {
  id: string
  code: string
  title: string
  semester: string
  level: number
  credits: number
  department: string
  lecturerId: string
  description?: string
}

export interface Student {
  id: string
  indexNumber: string
  firstName: string
  lastName: string
  email: string
  level: number
  department: string
  profileImage?: string
}

export interface Registration {
  id: string
  studentId: string
  courseId: string
  semester: string
  status: "Active" | "Dropped" | "Completed"
  registrationDate: string
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  lecturerId: string
  grade: string
  remarks?: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  approvedAt?: string
  approvedBy?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  urgency: "Normal" | "Important" | "Urgent"
  targetAudience: "All" | "Students" | "Lecturers" | "Admins"
  createdAt: string
  isActive: boolean
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
  ipAddress?: string
}

export interface DashboardStats {
  assignedCourses: number
  pendingGradeSubmissions: number
  totalStudents: number
  recentSubmissions: number
}
