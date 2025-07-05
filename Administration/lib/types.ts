export interface Student {
  id: string
  indexNumber: string
  surname: string
  otherNames: string
  gender: "Male" | "Female" | string
  dateOfBirth: string
  nationality: string
  programme: string
  level: string
  entryQualification: string
  status: "Active" | "Inactive" | "Graduated" | "Suspended" | string
  email: string
  phone: string
  address: string | {
    street?: string
    city?: string
    country?: string
    [key: string]: any
  }
  emergencyContact: {
    name: string | any
    phone: string | any
    relationship: string | any
    [key: string]: any
  }
  // Additional fields from registration system
  profilePictureUrl?: string
  religion?: string
  maritalStatus?: string
  nationalId?: string
  yearOfEntry?: string
  entryLevel?: string
  guardianName?: string
  guardianContact?: string
  guardianEmail?: string
  guardianAddress?: string
  guardian?: {
    name: string
    contact: string
    relationship: string
    email?: string
    address?: string
    [key: string]: any
  }
  guardianDetails?: {
    name: string
    contact: string
    relationship: string
    email?: string
    address?: string
    [key: string]: any
  }
  registrationDate?: string
  lastUpdated?: string
  personalDetails?: {
    [key: string]: any
  }
  contactDetails?: {
    [key: string]: any
  }
  academicDetails?: {
    [key: string]: any
  }
  createdAt?: string
  updatedAt?: string
  graduationEligible?: boolean
  source?: string
}

export interface Course {
  id: string
  code: string
  title: string
  creditHours: number
  semester: "First" | "Second"
  level: string
  lecturer: string
  department: string
  description: string
  prerequisites: string[]
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  academicYear: string
  semester: "First" | "Second"
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D+" | "D" | "E" | "F"
  gradePoint: number
  remarks: string
  status: "pending" | "approved" | "rejected"
  submittedBy: string
  submittedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface Registration {
  id: string
  studentId: string
  courseId: string
  academicYear: string
  semester: "First" | "Second"
  status: "pending" | "approved" | "rejected" | "dropped"
  registeredAt: string
  approvedBy?: string
  approvedAt?: string
  totalCredits: number
}

export interface Program {
  id: string
  name: string
  department: string
  coordinator: string
  entryRequirements: string
  duration: string
  description: string
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  urgency: "low" | "medium" | "high"
  targetAudience: "all" | "students" | "staff" | "specific"
  createdBy: string
  createdAt: string
  expiresAt?: string
  status: "active" | "expired" | "draft"
}

export interface Communication {
  id: string
  type: "email" | "sms" | "notification"
  subject: string
  message: string
  recipients: string[]
  sentBy: string
  sentAt: string
  status: "sent" | "failed" | "pending"
}

export interface User {
  id: string
  name: string
  email: string
  role: "Super Admin" | "Registrar" | "Academic Officer" | "Lecturer"
  permissions: string[]
  status: "Active" | "Inactive"
  lastActive: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  details: string
  timestamp: string
  ipAddress: string
}

export interface Settings {
  id: string
  academicYear: string
  currentSemester: "First" | "Second"
  registrationOpen: boolean
  gradeSubmissionDeadline: string
  maxCreditsPerSemester: number
  updatedBy: string
  updatedAt: string
}

export interface DashboardStats {
  totalStudents: number
  activeCourses: number
  pendingGrades: number
  upcomingDeadlines: number
}

// Fee Management Types
export interface Payment {
  id: string
  studentId: string
  studentName: string
  category: "Tuition" | "Hostel" | "Library" | "Other"
  amount: number
  method: "Bank Transfer" | "Mobile Money" | "Cash" | "Other"
  date: string
  status: "pending" | "verified" | "rejected"
  receiptUrl?: string
  rejectionReason?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FeeAccount {
  id: string
  studentId: string
  academicYear: string
  totalTuition: number
  totalHostel: number
  totalLibrary: number
  totalOther: number
  totalPaid: number
  balance: number
  lastPaymentDate?: string
  status: "paid" | "partial" | "unpaid" | "overdue"
  createdAt: string
  updatedAt: string
}

export interface FeeStats {
  totalCollected: number
  pendingVerification: number
  overdueAccounts: number
  categoryBreakdown: {
    tuition: number
    hostel: number
    library: number
    other?: number
  }
}

export interface BulkUploadResult {
  totalProcessed: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    error: string
  }>
}
