// Sample data for development and testing
import type { User, Course, Student, Registration, Grade, Announcement, AuditLog } from "./types"

export const sampleUsers: User[] = [
  {
    id: "lecturer-001",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@ucaes.edu.gh",
    role: "Lecturer",
    department: "Agricultural Sciences",
    assignedCourses: ["AGRI301", "AGRI401", "ENVS201"],
  },
  {
    id: "lecturer-002",
    name: "Prof. Michael Asante",
    email: "michael.asante@ucaes.edu.gh",
    role: "Lecturer",
    department: "Environmental Studies",
    assignedCourses: ["ENVS301", "ENVS401"],
  },
]

export const sampleCourses: Course[] = [
  {
    id: "AGRI301",
    code: "AGRI301",
    title: "Crop Production Systems",
    semester: "2024/2025 Semester 1",
    level: 300,
    credits: 3,
    department: "Agricultural Sciences",
    lecturerId: "lecturer-001",
    description: "Advanced study of crop production systems and sustainable farming practices.",
  },
  {
    id: "AGRI401",
    code: "AGRI401",
    title: "Agricultural Economics",
    semester: "2024/2025 Semester 1",
    level: 400,
    credits: 3,
    department: "Agricultural Sciences",
    lecturerId: "lecturer-001",
    description: "Economic principles applied to agricultural production and marketing.",
  },
  {
    id: "ENVS201",
    code: "ENVS201",
    title: "Environmental Chemistry",
    semester: "2024/2025 Semester 1",
    level: 200,
    credits: 3,
    department: "Environmental Studies",
    lecturerId: "lecturer-001",
    description: "Chemical processes in environmental systems.",
  },
  {
    id: "ENVS301",
    code: "ENVS301",
    title: "Environmental Impact Assessment",
    semester: "2024/2025 Semester 1",
    level: 300,
    credits: 3,
    department: "Environmental Studies",
    lecturerId: "lecturer-002",
    description: "Methods and practices for assessing environmental impacts.",
  },
  {
    id: "ENVS401",
    code: "ENVS401",
    title: "Climate Change and Adaptation",
    semester: "2024/2025 Semester 1",
    level: 400,
    credits: 3,
    department: "Environmental Studies",
    lecturerId: "lecturer-002",
    description: "Climate change science and adaptation strategies.",
  },
]

export const sampleStudents: Student[] = [
  {
    id: "student-001",
    indexNumber: "AG/2021/001234",
    firstName: "Kwame",
    lastName: "Osei",
    email: "kwame.osei@student.ucaes.edu.gh",
    level: 300,
    department: "Agricultural Sciences",
  },
  {
    id: "student-002",
    indexNumber: "AG/2021/001235",
    firstName: "Akosua",
    lastName: "Mensah",
    email: "akosua.mensah@student.ucaes.edu.gh",
    level: 300,
    department: "Agricultural Sciences",
  },
  {
    id: "student-003",
    indexNumber: "AG/2021/001236",
    firstName: "Kofi",
    lastName: "Asante",
    email: "kofi.asante@student.ucaes.edu.gh",
    level: 400,
    department: "Agricultural Sciences",
  },
  {
    id: "student-004",
    indexNumber: "ENV/2022/002001",
    firstName: "Ama",
    lastName: "Boateng",
    email: "ama.boateng@student.ucaes.edu.gh",
    level: 200,
    department: "Environmental Studies",
  },
  {
    id: "student-005",
    indexNumber: "ENV/2021/002002",
    firstName: "Yaw",
    lastName: "Owusu",
    email: "yaw.owusu@student.ucaes.edu.gh",
    level: 300,
    department: "Environmental Studies",
  },
]

export const sampleRegistrations: Registration[] = [
  {
    id: "reg-001",
    studentId: "student-001",
    courseId: "AGRI301",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
  },
  {
    id: "reg-002",
    studentId: "student-002",
    courseId: "AGRI301",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
  },
  {
    id: "reg-003",
    studentId: "student-003",
    courseId: "AGRI401",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
  },
  {
    id: "reg-004",
    studentId: "student-004",
    courseId: "ENVS201",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
  },
  {
    id: "reg-005",
    studentId: "student-005",
    courseId: "ENVS301",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
  },
]

export const sampleGrades: Grade[] = [
  {
    id: "grade-001",
    studentId: "student-001",
    courseId: "AGRI301",
    lecturerId: "lecturer-001",
    grade: "A",
    remarks: "Excellent performance",
    status: "pending",
    submittedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "grade-002",
    studentId: "student-002",
    courseId: "AGRI301",
    lecturerId: "lecturer-001",
    grade: "B+",
    remarks: "Good understanding of concepts",
    status: "approved",
    submittedAt: "2024-12-01T10:00:00Z",
    approvedAt: "2024-12-02T14:30:00Z",
    approvedBy: "admin-001",
  },
]

export const sampleAnnouncements: Announcement[] = [
  {
    id: "ann-001",
    title: "Mid-Semester Examination Schedule",
    content:
      "The mid-semester examinations will commence on Monday, November 18th, 2024. Please check your course schedules for specific dates and times.",
    authorId: "lecturer-001",
    authorName: "Dr. Sarah Johnson",
    urgency: "Important",
    targetAudience: "Students",
    createdAt: "2024-11-01T09:00:00Z",
    isActive: true,
  },
  {
    id: "ann-002",
    title: "Grade Submission Deadline",
    content:
      "All lecturers are reminded that the deadline for grade submission is Friday, December 15th, 2024 at 5:00 PM.",
    authorId: "admin-001",
    authorName: "Academic Office",
    urgency: "Urgent",
    targetAudience: "Lecturers",
    createdAt: "2024-11-15T08:00:00Z",
    isActive: true,
  },
]

export const sampleAuditLogs: AuditLog[] = [
  {
    id: "log-001",
    userId: "lecturer-001",
    userName: "Dr. Sarah Johnson",
    action: "Grade Submission",
    details: "Submitted grades for AGRI301 - 25 students",
    timestamp: "2024-12-01T10:00:00Z",
  },
  {
    id: "log-002",
    userId: "lecturer-001",
    userName: "Dr. Sarah Johnson",
    action: "Announcement Created",
    details: "Created announcement: Mid-Semester Examination Schedule",
    timestamp: "2024-11-01T09:00:00Z",
  },
]
