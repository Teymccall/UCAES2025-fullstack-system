/**
 * Academic Period Completion Tracker
 * Phase 2: Track and manage student period completions
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  StudentProgress, 
  StudentPeriodCompletion, 
  AcademicPeriod 
} from "./progression-types";
import { 
  AcademicYearUtils, 
  PeriodUtils 
} from "./progression-utils";
import { ProgressionEngine } from "./progression-engine";
import { logProgression } from "./progression-service";

// Collection names
const COLLECTIONS = {
  STUDENT_PROGRESS: "student-progress",
  ACADEMIC_PERIODS: "academic-periods",
  COURSE_REGISTRATIONS: "course-registrations",
  STUDENT_GRADES: "student-grades"
} as const;

/**
 * Period Tracker - Manages academic period completions
 */
export class PeriodTracker {

  /**
   * Get current academic periods for a schedule type
   */
  static async getCurrentPeriods(
    academicYear: string,
    scheduleType: "Regular" | "Weekend"
  ): Promise<AcademicPeriod[]> {
    const periodsRef = collection(db, COLLECTIONS.ACADEMIC_PERIODS);
    const periodsQuery = query(
      periodsRef,
      where("academicYear", "==", academicYear),
      where("scheduleType", "==", scheduleType),
      orderBy("periodNumber", "asc")
    );

    const snapshot = await getDocs(periodsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AcademicPeriod));
  }

  /**
   * Get active/current academic period
   */
  static async getActivePeriod(
    academicYear: string,
    scheduleType: "Regular" | "Weekend"
  ): Promise<AcademicPeriod | null> {
    const periods = await this.getCurrentPeriods(academicYear, scheduleType);
    const currentDate = new Date();

    // Find period that contains current date
    const activePeriod = periods.find(period => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      return currentDate >= startDate && currentDate <= endDate;
    });

    return activePeriod || null;
  }

  /**
   * Check if a period has ended
   */
  static isPeriodEnded(period: AcademicPeriod): boolean {
    const currentDate = new Date();
    const endDate = new Date(period.endDate);
    return currentDate > endDate;
  }

  /**
   * Check if a period is upcoming
   */
  static isPeriodUpcoming(period: AcademicPeriod): boolean {
    const currentDate = new Date();
    const startDate = new Date(period.startDate);
    return currentDate < startDate;
  }

  /**
   * Auto-complete periods that have ended
   */
  static async autoCompletePeriods(
    academicYear: string,
    scheduleType: "Regular" | "Weekend",
    dryRun: boolean = false
  ): Promise<{
    studentsProcessed: number;
    periodsCompleted: number;
    errors: string[];
  }> {
    console.log(`🔄 Auto-completing ended periods for ${scheduleType} students in ${academicYear}`);

    const results = {
      studentsProcessed: 0,
      periodsCompleted: 0,
      errors: []
    };

    try {
      // Get all periods for this academic year and schedule type
      const periods = await this.getCurrentPeriods(academicYear, scheduleType);
      const endedPeriods = periods.filter(period => this.isPeriodEnded(period));

      if (endedPeriods.length === 0) {
        console.log("📝 No ended periods found to auto-complete");
        return results;
      }

      console.log(`📅 Found ${endedPeriods.length} ended periods to process`);

      // Get all students for this academic year and schedule type
      const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
      const studentsQuery = query(
        progressRef,
        where("academicYear", "==", academicYear),
        where("scheduleType", "==", scheduleType)
      );

      const studentsSnapshot = await getDocs(studentsQuery);
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StudentProgress));

      console.log(`👥 Processing ${students.length} students`);

      // Process each student
      for (const student of students) {
        try {
          let studentUpdated = false;

          for (const period of endedPeriods) {
            // Check if this period is already marked as completed or failed
            const existingCompletion = student.periodsCompleted.find(
              p => p.period === period.name
            );

            if (existingCompletion && 
                (existingCompletion.status === "completed" || existingCompletion.status === "failed")) {
              continue; // Already processed
            }

            // Check if student has grades for this period
            const hasGrades = await this.checkStudentGradesForPeriod(
              student.studentId,
              academicYear,
              period.name
            );

            let newStatus: "completed" | "failed" | "pending" = "pending";
            let completionDate = new Date(period.endDate);

            if (hasGrades.hasGrades) {
              // Determine completion status based on grades
              if (hasGrades.averageGrade && hasGrades.averageGrade >= 50) { // Assuming 50 is pass mark
                newStatus = "completed";
              } else {
                newStatus = "failed";
              }
            } else {
              // No grades found - check if there are course registrations
              const hasRegistrations = await this.checkStudentRegistrationsForPeriod(
                student.studentId,
                academicYear,
                period.name
              );

              if (hasRegistrations) {
                // Has registrations but no grades - assume pending
                newStatus = "pending";
              } else {
                // No registrations and no grades - assume not participating
                continue;
              }
            }

            if (!dryRun) {
              // Update the student's period completion
              const updateResult = await ProgressionEngine.updateStudentPeriodCompletion(
                student.studentId,
                academicYear,
                period.name,
                newStatus,
                hasGrades.averageGrade?.toString(),
                hasGrades.averageGPA,
                hasGrades.creditsEarned,
                hasGrades.creditsAttempted,
                completionDate,
                `Auto-completed on ${new Date().toISOString()}`
              );

              if (updateResult.success) {
                results.periodsCompleted++;
                studentUpdated = true;
              } else {
                results.errors.push(`Failed to update ${student.studentId} for period ${period.name}: ${updateResult.message}`);
              }
            } else {
              // Dry run - just log what would happen
              console.log(`📝 Would mark ${student.studentId} - ${period.name} as ${newStatus}`);
              results.periodsCompleted++;
              studentUpdated = true;
            }
          }

          if (studentUpdated) {
            results.studentsProcessed++;
          }

        } catch (error) {
          const errorMsg = `Error processing student ${student.studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      await logProgression("info", "auto_complete_periods", 
        `Auto-completed periods for ${scheduleType} students in ${academicYear}`, {
        academicYear,
        scheduleType,
        studentsProcessed: results.studentsProcessed,
        periodsCompleted: results.periodsCompleted,
        errors: results.errors,
        dryRun
      });

      console.log(`✅ Auto-completion completed:`, results);
      return results;

    } catch (error) {
      const errorMsg = `Error in auto-complete periods: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
      
      await logProgression("error", "auto_complete_periods_failed", errorMsg, { error: errorMsg });
      
      return results;
    }
  }

  /**
   * Check if student has grades for a specific period
   */
  private static async checkStudentGradesForPeriod(
    studentId: string,
    academicYear: string,
    periodName: string
  ): Promise<{
    hasGrades: boolean;
    averageGrade?: number;
    averageGPA?: number;
    creditsEarned?: number;
    creditsAttempted?: number;
  }> {
    try {
      // This would need to be adapted based on your grading system structure
      // For now, we'll simulate the check
      
      // In a real implementation, you would query the grades collection
      // const gradesRef = collection(db, COLLECTIONS.STUDENT_GRADES);
      // const gradesQuery = query(
      //   gradesRef,
      //   where("studentId", "==", studentId),
      //   where("academicYear", "==", academicYear),
      //   where("semester", "==", periodName) // or however periods are mapped
      // );
      
      // For Phase 2, we'll return a simulated result
      // This will be enhanced in later phases when integrated with grading system
      
      return {
        hasGrades: false, // Will be true when integrated with actual grading system
        averageGrade: undefined,
        averageGPA: undefined,
        creditsEarned: undefined,
        creditsAttempted: undefined
      };

    } catch (error) {
      console.error("Error checking student grades:", error);
      return { hasGrades: false };
    }
  }

  /**
   * Check if student has course registrations for a specific period
   */
  private static async checkStudentRegistrationsForPeriod(
    studentId: string,
    academicYear: string,
    periodName: string
  ): Promise<boolean> {
    try {
      // Check course registrations
      const registrationsRef = collection(db, COLLECTIONS.COURSE_REGISTRATIONS);
      const registrationsQuery = query(
        registrationsRef,
        where("studentId", "==", studentId),
        where("academicYear", "==", academicYear)
        // Additional filtering by period/semester would go here
      );

      const snapshot = await getDocs(registrationsQuery);
      return !snapshot.empty;

    } catch (error) {
      console.error("Error checking student registrations:", error);
      return false;
    }
  }

  /**
   * Manually update period completion for a student
   */
  static async manuallyUpdatePeriodCompletion(
    studentId: string,
    academicYear: string,
    periodName: string,
    status: "completed" | "failed" | "pending" | "in_progress",
    details: {
      grade?: string;
      gpa?: number;
      creditsEarned?: number;
      creditsAttempted?: number;
      notes?: string;
      overrideReason?: string;
    },
    updatedBy: string
  ): Promise<{ success: boolean; message: string }> {
    console.log(`✏️ Manually updating period completion for ${studentId}: ${periodName} = ${status}`);

    try {
      const result = await ProgressionEngine.updateStudentPeriodCompletion(
        studentId,
        academicYear,
        periodName,
        status,
        details.grade,
        details.gpa,
        details.creditsEarned,
        details.creditsAttempted,
        new Date(),
        `Manual update by ${updatedBy}: ${details.notes || ''} ${details.overrideReason ? `(Override: ${details.overrideReason})` : ''}`
      );

      if (result.success) {
        await logProgression("info", "manual_period_update", 
          `Manually updated period completion: ${studentId} - ${periodName} = ${status}`, {
          studentId,
          academicYear,
          periodName,
          status,
          details,
          updatedBy
        }, studentId, updatedBy);
      }

      return result;

    } catch (error) {
      const errorMsg = `Error in manual period update: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      
      await logProgression("error", "manual_period_update_failed", errorMsg, {
        studentId,
        academicYear,
        periodName,
        error: errorMsg
      }, studentId, updatedBy);

      return {
        success: false,
        message: errorMsg
      };
    }
  }

  /**
   * Get period completion summary for a student
   */
  static async getStudentPeriodSummary(
    studentId: string,
    academicYear: string
  ): Promise<{
    student: StudentProgress | null;
    periods: AcademicPeriod[];
    completionSummary: {
      completed: number;
      failed: number;
      pending: number;
      inProgress: number;
      total: number;
      percentage: number;
    };
    isEligibleForProgression: boolean;
    nextActions: string[];
  }> {
    try {
      // Get student progress
      const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
      const studentQuery = query(
        progressRef,
        where("studentId", "==", studentId),
        where("academicYear", "==", academicYear)
      );

      const studentSnapshot = await getDocs(studentQuery);
      const student = studentSnapshot.empty ? null : {
        id: studentSnapshot.docs[0].id,
        ...studentSnapshot.docs[0].data()
      } as StudentProgress;

      if (!student) {
        return {
          student: null,
          periods: [],
          completionSummary: {
            completed: 0, failed: 0, pending: 0, inProgress: 0, total: 0, percentage: 0
          },
          isEligibleForProgression: false,
          nextActions: ["Student progress record not found"]
        };
      }

      // Get academic periods
      const periods = await this.getCurrentPeriods(academicYear, student.scheduleType);

      // Calculate completion summary
      const completionSummary = PeriodUtils.getPeriodStatusSummary(student.periodsCompleted);
      const totalPeriods = periods.length;
      const percentage = totalPeriods > 0 ? Math.round((completionSummary.completed / totalPeriods) * 100) : 0;

      // Check progression eligibility
      const eligibilityCheck = await ProgressionEngine.checkStudentEligibility(studentId, academicYear);

      // Determine next actions
      const nextActions: string[] = [];
      
      if (eligibilityCheck.isEligible) {
        nextActions.push("Student is eligible for progression");
      } else if (eligibilityCheck.missingRequirements) {
        nextActions.push(...eligibilityCheck.missingRequirements);
      }

      // Check for incomplete periods
      for (const period of periods) {
        const periodCompletion = student.periodsCompleted.find(p => p.period === period.name);
        if (!periodCompletion) {
          if (this.isPeriodEnded(period)) {
            nextActions.push(`Complete missing period: ${period.name}`);
          } else if (!this.isPeriodUpcoming(period)) {
            nextActions.push(`Currently in progress: ${period.name}`);
          }
        }
      }

      return {
        student,
        periods,
        completionSummary: {
          ...completionSummary,
          total: totalPeriods,
          percentage
        },
        isEligibleForProgression: eligibilityCheck.isEligible,
        nextActions
      };

    } catch (error) {
      console.error("Error getting student period summary:", error);
      throw error;
    }
  }

  /**
   * Get period completion overview for all students
   */
  static async getPeriodCompletionOverview(
    academicYear: string,
    scheduleType?: "Regular" | "Weekend"
  ): Promise<{
    totalStudents: number;
    byPeriod: {
      [periodName: string]: {
        completed: number;
        failed: number;
        pending: number;
        inProgress: number;
        notStarted: number;
      };
    };
    byLevel: {
      [level: string]: {
        completed: number;
        failed: number;
        pending: number;
        inProgress: number;
      };
    };
  }> {
    try {
      // Get all students for the academic year
      const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
      let studentsQuery = query(
        progressRef,
        where("academicYear", "==", academicYear)
      );

      if (scheduleType) {
        studentsQuery = query(
          progressRef,
          where("academicYear", "==", academicYear),
          where("scheduleType", "==", scheduleType)
        );
      }

      const studentsSnapshot = await getDocs(studentsQuery);
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StudentProgress));

      const overview = {
        totalStudents: students.length,
        byPeriod: {} as any,
        byLevel: {} as any
      };

      // Initialize counters
      for (const student of students) {
        // Initialize level counters
        if (!overview.byLevel[student.currentLevel]) {
          overview.byLevel[student.currentLevel] = {
            completed: 0, failed: 0, pending: 0, inProgress: 0
          };
        }

        // Process each period completion
        for (const period of student.periodsCompleted) {
          if (!overview.byPeriod[period.period]) {
            overview.byPeriod[period.period] = {
              completed: 0, failed: 0, pending: 0, inProgress: 0, notStarted: 0
            };
          }

          overview.byPeriod[period.period][period.status]++;
          overview.byLevel[student.currentLevel][period.status]++;
        }
      }

      return overview;

    } catch (error) {
      console.error("Error getting period completion overview:", error);
      throw error;
    }
  }
}

export default PeriodTracker;





