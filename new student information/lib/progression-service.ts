/**
 * Student Level Progression Service
 * Phase 1: Foundation - Non-disruptive tracking and utilities
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  ProgressionRule, 
  StudentProgress, 
  ProgressionHistory, 
  AcademicPeriod, 
  ProgressionBatch,
  ProgressionEligibilityCheck,
  ProgressionSummary,
  StudentPeriodCompletion,
  ProgressionLog
} from "./progression-types";

// Collection names
const COLLECTIONS = {
  PROGRESSION_RULES: "progression-rules",
  STUDENT_PROGRESS: "student-progress", 
  PROGRESSION_HISTORY: "progression-history",
  ACADEMIC_PERIODS: "academic-periods",
  PROGRESSION_BATCHES: "progression-batches",
  PROGRESSION_LOGS: "progression-logs"
} as const;

/**
 * Initialize default progression rules
 */
export async function initializeProgressionRules(): Promise<void> {
  console.log("🔧 Initializing progression rules...");
  
  const rulesRef = collection(db, COLLECTIONS.PROGRESSION_RULES);
  
  // Check if rules already exist
  const existingRules = await getDocs(rulesRef);
  if (!existingRules.empty) {
    console.log("✅ Progression rules already exist, skipping initialization");
    return;
  }
  
  // Default rules based on your requirements
  const defaultRules: Omit<ProgressionRule, "id">[] = [
    {
      scheduleType: "Regular",
      requiredPeriods: 2,
      progressionMonth: 9, // September
      progressionDay: 1,
      academicYearStartMonth: 9, // September
      periodNames: ["First Semester", "Second Semester"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      scheduleType: "Weekend", 
      requiredPeriods: 3,
      progressionMonth: 10, // October
      progressionDay: 1,
      academicYearStartMonth: 10, // October
      periodNames: ["First Trimester", "Second Trimester", "Third Trimester"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  for (const rule of defaultRules) {
    await addDoc(rulesRef, {
      ...rule,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Created progression rule for ${rule.scheduleType} students`);
  }
  
  console.log("✅ Progression rules initialized successfully");
}

/**
 * Get progression rules
 */
export async function getProgressionRules(): Promise<ProgressionRule[]> {
  const rulesRef = collection(db, COLLECTIONS.PROGRESSION_RULES);
  const activeRulesQuery = query(rulesRef, where("isActive", "==", true));
  
  const snapshot = await getDocs(activeRulesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ProgressionRule));
}

/**
 * Get progression rule for specific schedule type
 */
export async function getProgressionRule(scheduleType: "Regular" | "Weekend"): Promise<ProgressionRule | null> {
  const rules = await getProgressionRules();
  return rules.find(rule => rule.scheduleType === scheduleType) || null;
}

/**
 * Create or update student progress record
 */
export async function createStudentProgress(
  studentId: string,
  studentEmail: string,
  academicYear: string,
  scheduleType: "Regular" | "Weekend",
  currentLevel: string,
  entryLevel: string
): Promise<string> {
  const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
  
  // Check if progress record already exists
  const existingQuery = query(
    progressRef,
    where("studentId", "==", studentId),
    where("academicYear", "==", academicYear)
  );
  
  const existingDocs = await getDocs(existingQuery);
  
  if (!existingDocs.empty) {
    console.log(`📋 Progress record already exists for student ${studentId} in ${academicYear}`);
    return existingDocs.docs[0].id;
  }
  
  const progressData: Omit<StudentProgress, "id"> = {
    studentId,
    studentEmail,
    academicYear,
    scheduleType,
    currentLevel,
    entryLevel,
    periodsCompleted: [],
    progressionStatus: "not-eligible",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const docRef = await addDoc(progressRef, {
    ...progressData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  await logProgression("info", "student_progress_created", 
    `Created progress record for student ${studentId}`, {
    studentId,
    academicYear,
    scheduleType,
    currentLevel
  });
  
  console.log(`✅ Created progress record for student ${studentId}: ${docRef.id}`);
  return docRef.id;
}

/**
 * Get student progress for specific academic year
 */
export async function getStudentProgress(
  studentId: string, 
  academicYear: string
): Promise<StudentProgress | null> {
  const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
  const progressQuery = query(
    progressRef,
    where("studentId", "==", studentId),
    where("academicYear", "==", academicYear),
    limit(1)
  );
  
  const snapshot = await getDocs(progressQuery);
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  } as StudentProgress;
}

/**
 * Update period completion status
 */
export async function updatePeriodCompletion(
  progressId: string,
  periodCompletion: StudentPeriodCompletion
): Promise<void> {
  const progressDoc = doc(db, COLLECTIONS.STUDENT_PROGRESS, progressId);
  const progressData = await getDoc(progressDoc);
  
  if (!progressData.exists()) {
    throw new Error(`Progress record not found: ${progressId}`);
  }
  
  const currentProgress = progressData.data() as StudentProgress;
  const periodsCompleted = [...(currentProgress.periodsCompleted || [])];
  
  // Find existing period or add new one
  const existingIndex = periodsCompleted.findIndex(p => p.period === periodCompletion.period);
  
  if (existingIndex >= 0) {
    periodsCompleted[existingIndex] = { ...periodsCompleted[existingIndex], ...periodCompletion };
  } else {
    periodsCompleted.push(periodCompletion);
  }
  
  await updateDoc(progressDoc, {
    periodsCompleted,
    updatedAt: serverTimestamp()
  });
  
  await logProgression("info", "period_completion_updated", 
    `Updated period completion for ${periodCompletion.period}`, {
    progressId,
    studentId: currentProgress.studentId,
    period: periodCompletion.period,
    status: periodCompletion.status
  });
  
  console.log(`✅ Updated period completion for progress ${progressId}`);
}

/**
 * Check if student is eligible for progression
 */
export async function checkProgressionEligibility(
  studentId: string,
  academicYear: string
): Promise<ProgressionEligibilityCheck> {
  const progress = await getStudentProgress(studentId, academicYear);
  
  if (!progress) {
    return {
      studentId,
      isEligible: false,
      currentLevel: "unknown",
      reason: "No progress record found",
      periodsStatus: [],
      requiredPeriods: 0,
      completedPeriods: 0,
      missingRequirements: ["Progress record not found"]
    };
  }
  
  const rule = await getProgressionRule(progress.scheduleType);
  
  if (!rule) {
    return {
      studentId,
      isEligible: false,
      currentLevel: progress.currentLevel,
      reason: "No progression rule found for schedule type",
      periodsStatus: progress.periodsCompleted,
      requiredPeriods: 0,
      completedPeriods: progress.periodsCompleted.length,
      missingRequirements: [`No rule found for ${progress.scheduleType} students`]
    };
  }
  
  const completedPeriods = progress.periodsCompleted.filter(p => p.status === "completed");
  const failedPeriods = progress.periodsCompleted.filter(p => p.status === "failed");
  const isEligible = completedPeriods.length >= rule.requiredPeriods;
  
  let reason = "";
  let nextLevel: string | undefined;
  let missingRequirements: string[] = [];
  
  if (isEligible) {
    reason = `Completed ${completedPeriods.length}/${rule.requiredPeriods} required periods`;
    const currentLevelNum = parseInt(progress.currentLevel);
    nextLevel = (currentLevelNum + 100).toString();
  } else {
    const remaining = rule.requiredPeriods - completedPeriods.length;
    reason = `Need to complete ${remaining} more period(s)`;
    missingRequirements.push(`Complete ${remaining} more period(s)`);
  }
  
  if (failedPeriods.length > 0) {
    missingRequirements.push(`${failedPeriods.length} failed period(s) need review`);
  }
  
  return {
    studentId,
    isEligible,
    currentLevel: progress.currentLevel,
    nextLevel,
    reason,
    periodsStatus: progress.periodsCompleted,
    requiredPeriods: rule.requiredPeriods,
    completedPeriods: completedPeriods.length,
    missingRequirements: missingRequirements.length > 0 ? missingRequirements : undefined
  };
}

/**
 * Get progression summary for academic year
 */
export async function getProgressionSummary(academicYear: string): Promise<ProgressionSummary> {
  const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
  const progressQuery = query(progressRef, where("academicYear", "==", academicYear));
  
  const snapshot = await getDocs(progressQuery);
  const progressRecords = snapshot.docs.map(doc => doc.data() as StudentProgress);
  
  const summary: ProgressionSummary = {
    totalStudents: progressRecords.length,
    eligibleForProgression: 0,
    notEligible: 0,
    alreadyProgressed: 0,
    pendingReview: 0,
    byLevel: {}
  };
  
  for (const record of progressRecords) {
    // Count by status
    switch (record.progressionStatus) {
      case "eligible":
        summary.eligibleForProgression++;
        break;
      case "not-eligible":
        summary.notEligible++;
        break;
      case "progressed":
        summary.alreadyProgressed++;
        break;
      case "pending-review":
        summary.pendingReview++;
        break;
    }
    
    // Count by level
    const level = record.currentLevel;
    if (!summary.byLevel[level]) {
      summary.byLevel[level] = { total: 0, eligible: 0, notEligible: 0 };
    }
    
    summary.byLevel[level].total++;
    
    if (record.progressionStatus === "eligible") {
      summary.byLevel[level].eligible++;
    } else if (record.progressionStatus === "not-eligible") {
      summary.byLevel[level].notEligible++;
    }
  }
  
  return summary;
}

/**
 * Log progression events
 */
export async function logProgression(
  level: "info" | "warning" | "error" | "success",
  action: string,
  message: string,
  details?: any,
  studentId?: string,
  adminId?: string,
  batchId?: string
): Promise<void> {
  const logRef = collection(db, COLLECTIONS.PROGRESSION_LOGS);
  
  const logData: Omit<ProgressionLog, "id"> = {
    timestamp: new Date(),
    level,
    action,
    message,
    details,
    studentId,
    adminId,
    batchId
  };
  
  await addDoc(logRef, {
    ...logData,
    timestamp: serverTimestamp()
  });
}

/**
 * Get progression logs
 */
export async function getProgressionLogs(
  limitCount: number = 100,
  studentId?: string
): Promise<ProgressionLog[]> {
  const logsRef = collection(db, COLLECTIONS.PROGRESSION_LOGS);
  
  let logsQuery = query(
    logsRef,
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  
  if (studentId) {
    logsQuery = query(
      logsRef,
      where("studentId", "==", studentId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
  }
  
  const snapshot = await getDocs(logsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ProgressionLog));
}

/**
 * Initialize progression system for existing students
 */
export async function initializeExistingStudents(): Promise<void> {
  console.log("🔧 Initializing progression tracking for existing students...");
  
  // This function will be called to create initial progress records
  // for students who are already in the system
  await logProgression("info", "system_initialization", 
    "Started initialization of progression tracking for existing students");
  
  console.log("✅ Progression tracking initialization completed");
}





