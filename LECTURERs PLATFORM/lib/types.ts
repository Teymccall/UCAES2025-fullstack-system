// Common type definitions for the lecturer platform

export type DashboardStats = {
  assignedCourses: number;
  pendingGradeSubmissions: number;
  totalStudents: number;
  recentSubmissions: number;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g., "2023/2024"
  name: string; // Same as year but can have different formatting
  startDate: Date | string;
  endDate: Date | string;
  status: "active" | "completed" | "upcoming";
}

export interface AcademicSemester {
  id: string;
  name: string; // e.g., "First Semester"
  academicYear: string; // Reference to academic year ID
  programType: "Regular" | "Weekend";
  startDate: Date | string;
  endDate: Date | string;
  status: "active" | "completed" | "upcoming";
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  credits: number;
  level: number;
  department: string;
}

export interface Student {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  department: string;
}

export interface StudentGrade {
  studentId: string;
  student: Student;
  assessment: number;
  midsem: number;
  exams: number;
  total: number;
  grade: string;
}

// This matches what the academic affairs system is using
export interface Registration {
  id?: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  email: string;
  academicYear?: string;
  academicYearId?: string;
  semester?: string;
  academicSemesterId?: string;
  semesterId?: string;
  level: string;
  program?: string;
  programId?: string;
  studyMode: "Regular" | "Weekend";
  courses: Array<{
    courseId?: string;
    id?: string;
    courseCode?: string;
    courseName?: string;
    code?: string;
    title?: string;
    credits: number;
  }>;
  totalCredits: number;
  registrationDate: any;
  status: string;
  registeredBy: string;
}

export interface CourseRegistration {
  id: string;
  studentId: string;
  courseId: string;
  academicYearId: string;
  academicSemesterId: string;
  status: string;
}

export interface LecturerAssignment {
  id?: string;
  lecturerId: string;
  academicYearId: string;
  academicSemesterId: string;
  programId: string;
  courseId: string;
  programmeCourseType: "Regular" | "Weekend";
  level: number;
  status: string;
}
