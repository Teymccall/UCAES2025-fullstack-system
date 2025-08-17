/**
 * Student Level Progression System - Type Definitions
 * Phase 1: Foundation - Non-disruptive tracking system
 */

export interface ProgressionRule {
  id: string;
  scheduleType: "Regular" | "Weekend";
  requiredPeriods: number; // 2 for Regular (semesters), 3 for Weekend (trimesters)
  progressionMonth: number; // 9 for Regular (September), 10 for Weekend (October)
  progressionDay: number; // 1st of the month
  academicYearStartMonth: number; // 9 for Regular (September), 10 for Weekend (October)
  periodNames: string[]; // ["First Semester", "Second Semester"] or ["First Trimester", "Second Trimester", "Third Trimester"]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentPeriodCompletion {
  period: string; // "First Semester", "Second Trimester", etc.
  status: "completed" | "failed" | "pending" | "in_progress";
  completionDate?: Date;
  grade?: string; // Overall grade for the period
  creditsEarned?: number;
  creditsAttempted?: number;
  gpa?: number; // GPA for this period
  notes?: string; // Additional notes
}

export interface StudentProgress {
  id: string;
  studentId: string; // UCAES registration number
  studentEmail: string; // For easy lookup
  academicYear: string; // "2024/2025"
  scheduleType: "Regular" | "Weekend";
  currentLevel: string; // "200"
  entryLevel: string; // "100" - never changes
  periodsCompleted: StudentPeriodCompletion[];
  
  // Progression eligibility
  progressionStatus: "eligible" | "not-eligible" | "progressed" | "repeated" | "pending-review";
  nextLevel?: string; // "300" if eligible
  progressionDate?: Date; // When they will/did progress
  
  // Performance tracking
  overallGPA?: number;
  totalCreditsEarned?: number;
  totalCreditsAttempted?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Admin who created this record
  lastReviewedBy?: string; // Admin who last reviewed
  lastReviewedAt?: Date;
}

export interface ProgressionHistory {
  id: string;
  studentId: string;
  studentName: string; // For easier reporting
  registrationNumber: string; // UCAES number
  
  // Progression details
  fromLevel: string; // "200"
  toLevel: string; // "300"
  academicYear: string; // "2024/2025" - the year they completed
  scheduleType: "Regular" | "Weekend";
  
  // Progression metadata
  progressionDate: Date;
  progressionType: "automatic" | "manual" | "partial" | "conditional";
  approvedBy?: string; // Admin user ID
  reason?: string; // "completed all periods", "partial progression due to failure", etc.
  
  // Performance summary
  periodsCompleted: number; // How many periods they actually completed
  totalPeriods: number; // How many periods they should have completed
  overallGPA?: number;
  creditsEarned?: number;
  
  // Academic record links
  previousProgressId?: string; // Link to StudentProgress record
  newProgressId?: string; // Link to new StudentProgress record for next level
  
  // Metadata
  createdAt: Date;
  notes?: string; // Additional notes or conditions
}

export interface AcademicPeriod {
  id: string;
  name: string; // "First Semester 2024/2025"
  type: "semester" | "trimester";
  scheduleType: "Regular" | "Weekend";
  academicYear: string; // "2024/2025"
  periodNumber: number; // 1, 2, or 3
  
  // Dates
  startDate: Date;
  endDate: Date;
  registrationStartDate?: Date;
  registrationEndDate?: Date;
  examStartDate?: Date;
  examEndDate?: Date;
  
  // Status
  status: "upcoming" | "active" | "completed" | "cancelled";
  
  // Progression related
  isProgressionPeriod: boolean; // true if progression happens after this period
  progressionDate?: Date; // When progression happens for this period
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressionBatch {
  id: string;
  batchName: string; // "September 2025 Regular Students Progression"
  academicYear: string; // "2024/2025" - year being completed
  scheduleType: "Regular" | "Weekend";
  
  // Batch details
  progressionDate: Date;
  processedDate?: Date;
  processedBy?: string; // Admin who processed
  
  // Statistics
  totalStudents: number;
  eligibleStudents: number;
  progressedStudents: number;
  failedProgressions: number;
  manualReviewRequired: number;
  
  // Status
  status: "pending" | "processing" | "completed" | "failed";
  
  // Results
  progressionResults: {
    studentId: string;
    status: "progressed" | "repeated" | "manual-review" | "failed";
    fromLevel: string;
    toLevel?: string;
    reason?: string;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// Utility types for API responses
export interface ProgressionEligibilityCheck {
  studentId: string;
  isEligible: boolean;
  currentLevel: string;
  nextLevel?: string;
  reason: string;
  periodsStatus: StudentPeriodCompletion[];
  requiredPeriods: number;
  completedPeriods: number;
  missingRequirements?: string[];
}

export interface ProgressionSummary {
  totalStudents: number;
  eligibleForProgression: number;
  notEligible: number;
  alreadyProgressed: number;
  pendingReview: number;
  byLevel: {
    [level: string]: {
      total: number;
      eligible: number;
      notEligible: number;
    };
  };
}

export type ProgressionLogLevel = "info" | "warning" | "error" | "success";

export interface ProgressionLog {
  id: string;
  timestamp: Date;
  level: ProgressionLogLevel;
  action: string; // "progression_check", "batch_processing", "manual_override"
  message: string;
  details?: any; // Additional structured data
  studentId?: string;
  adminId?: string;
  batchId?: string;
}























