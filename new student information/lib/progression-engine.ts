/**
 * Student Level Progression Engine
 * Phase 2: Core progression logic and processing
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
  writeBatch,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  ProgressionRule, 
  StudentProgress, 
  ProgressionHistory, 
  ProgressionBatch,
  ProgressionEligibilityCheck,
  StudentPeriodCompletion
} from "./progression-types";
import { 
  AcademicYearUtils, 
  LevelUtils, 
  PeriodUtils, 
  ProgressionTimingUtils,
  ValidationUtils
} from "./progression-utils";
import { 
  getProgressionRule,
  getStudentProgress,
  updatePeriodCompletion,
  logProgression
} from "./progression-service";
import { 
  AcademicIntegrationService, 
  type CentralizedAcademicPeriod 
} from "./academic-integration";
import { 
  ProgressionProtectionEngine, 
  type ProtectionCheckResult 
} from "./progression-protection";

// Collection names
const COLLECTIONS = {
  PROGRESSION_RULES: "progression-rules",
  STUDENT_PROGRESS: "student-progress", 
  PROGRESSION_HISTORY: "progression-history",
  PROGRESSION_BATCHES: "progression-batches",
  PROGRESSION_LOGS: "progression-logs",
  STUDENTS: "students",
  STUDENT_REGISTRATIONS: "student-registrations"
} as const;

/**
 * Progression Engine - Core processing logic
 */
export class ProgressionEngine {
  
  /**
   * Check progression eligibility for a single student
   */
  static async checkStudentEligibility(
    studentId: string,
    academicYear: string,
    forceRefresh: boolean = false
  ): Promise<ProgressionEligibilityCheck> {
    console.log(`🔍 Checking progression eligibility for student ${studentId} in ${academicYear}`);
    
    try {
      const progress = await getStudentProgress(studentId, academicYear);
      
      if (!progress) {
        return {
          studentId,
          isEligible: false,
          currentLevel: "unknown",
          reason: "No progress record found for this academic year",
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
          reason: `No progression rule found for ${progress.scheduleType} students`,
          periodsStatus: progress.periodsCompleted,
          requiredPeriods: 0,
          completedPeriods: progress.periodsCompleted.length,
          missingRequirements: [`No progression rule configured for ${progress.scheduleType} students`]
        };
      }

      // Check if student can progress from current level
      if (!LevelUtils.canProgressFromLevel(progress.currentLevel)) {
        return {
          studentId,
          isEligible: false,
          currentLevel: progress.currentLevel,
          reason: `Student is at maximum level (${progress.currentLevel})`,
          periodsStatus: progress.periodsCompleted,
          requiredPeriods: rule.requiredPeriods,
          completedPeriods: progress.periodsCompleted.filter(p => p.status === "completed").length,
          missingRequirements: [`Already at maximum level ${progress.currentLevel}`]
        };
      }

      // Check period completion
      const completedPeriods = progress.periodsCompleted.filter(p => p.status === "completed");
      const failedPeriods = progress.periodsCompleted.filter(p => p.status === "failed");
      const pendingPeriods = progress.periodsCompleted.filter(p => p.status === "pending");
      const inProgressPeriods = progress.periodsCompleted.filter(p => p.status === "in_progress");

      const isEligible = completedPeriods.length >= rule.requiredPeriods;
      let reason = "";
      let nextLevel: string | undefined;
      let missingRequirements: string[] = [];

      if (isEligible) {
        reason = `Completed ${completedPeriods.length}/${rule.requiredPeriods} required periods`;
        nextLevel = LevelUtils.getNextLevel(progress.currentLevel);
        
        // Check for any failed periods that might need attention
        if (failedPeriods.length > 0) {
          missingRequirements.push(`${failedPeriods.length} failed period(s) - may need review for conditional progression`);
        }
      } else {
        const remaining = rule.requiredPeriods - completedPeriods.length;
        reason = `Needs ${remaining} more completed period(s)`;
        missingRequirements.push(`Complete ${remaining} more period(s)`);
        
        if (pendingPeriods.length > 0) {
          missingRequirements.push(`${pendingPeriods.length} period(s) pending completion`);
        }
        
        if (inProgressPeriods.length > 0) {
          missingRequirements.push(`${inProgressPeriods.length} period(s) currently in progress`);
        }
      }

      // Additional checks for partial progression scenarios
      if (failedPeriods.length > 0 && completedPeriods.length > 0) {
        const partialCompletionRate = completedPeriods.length / rule.requiredPeriods;
        if (partialCompletionRate >= 0.5) { // At least 50% completion
          missingRequirements.push("Eligible for partial progression consideration");
        }
      }

      const eligibilityCheck: ProgressionEligibilityCheck = {
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

      await logProgression("info", "eligibility_check", 
        `Checked eligibility for student ${studentId}: ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`, 
        eligibilityCheck, studentId);

      return eligibilityCheck;

    } catch (error) {
      console.error(`Error checking eligibility for student ${studentId}:`, error);
      
      await logProgression("error", "eligibility_check_failed", 
        `Failed to check eligibility for student ${studentId}: ${error}`, 
        { error: error instanceof Error ? error.message : 'Unknown error' }, studentId);

      return {
        studentId,
        isEligible: false,
        currentLevel: "error",
        reason: "Error occurred during eligibility check",
        periodsStatus: [],
        requiredPeriods: 0,
        completedPeriods: 0,
        missingRequirements: ["System error - please try again"]
      };
    }
  }

  /**
   * Process progression for a single student (with academic year boundary protection)
   */
  static async progressStudent(
    studentId: string,
    academicYear: string,
    progressionType: "automatic" | "manual" | "partial" | "conditional" = "automatic",
    approvedBy?: string,
    reason?: string,
    forceProgression: boolean = false,
    emergencyOverrideToken?: string
  ): Promise<{ success: boolean; message: string; historyId?: string; protectionWarnings?: string[] }> {
    console.log(`🎓 Processing progression for student ${studentId} (${progressionType})`);
    
    try {
      // PHASE 3: Check academic year boundary protection first
      if (!emergencyOverrideToken) {
        const protectionCheck = await ProgressionProtectionEngine.checkProgressionProtection(
          academicYear,
          forceProgression ? "permissive" : "strict"
        );

        if (!protectionCheck.isAllowed) {
          await logProgression("warning", "progression_blocked_by_protection", 
            `Progression blocked for student ${studentId} by academic year boundary protection`, {
            studentId,
            academicYear,
            blockingFactors: protectionCheck.blockingFactors,
            recommendations: protectionCheck.recommendations
          }, studentId, approvedBy);

          return {
            success: false,
            message: `Progression blocked by academic year boundary protection: ${protectionCheck.blockingFactors.join(', ')}`,
            protectionWarnings: protectionCheck.recommendations
          };
        }

        // Log protection warnings if any
        if (protectionCheck.warnings.length > 0) {
          await logProgression("warning", "progression_protection_warnings", 
            `Progression proceeding with protection warnings for student ${studentId}`, {
            studentId,
            academicYear,
            warnings: protectionCheck.warnings
          }, studentId, approvedBy);
        }
      } else {
        await logProgression("warning", "progression_emergency_override", 
          `Progression proceeding with emergency override for student ${studentId}`, {
          studentId,
          academicYear,
          emergencyOverrideToken
        }, studentId, approvedBy);
      }

      // Check student eligibility (unless forced)
      if (!forceProgression) {
        const eligibilityCheck = await this.checkStudentEligibility(studentId, academicYear);
        
        if (!eligibilityCheck.isEligible && progressionType === "automatic") {
          return {
            success: false,
            message: `Student not eligible for automatic progression: ${eligibilityCheck.reason}`
          };
        }
      }

      const progress = await getStudentProgress(studentId, academicYear);
      if (!progress) {
        return {
          success: false,
          message: "Student progress record not found"
        };
      }

      const rule = await getProgressionRule(progress.scheduleType);
      if (!rule) {
        return {
          success: false,
          message: `No progression rule found for ${progress.scheduleType} students`
        };
      }

      // Calculate new level
      const newLevel = LevelUtils.getNextLevel(progress.currentLevel);
      
      // PHASE 3: Get next academic year from centralized system
      const currentPeriod = await AcademicIntegrationService.getCurrentAcademicPeriod();
      let nextAcademicYear = AcademicYearUtils.getNextAcademicYear(academicYear);
      
      if (currentPeriod && currentPeriod.currentAcademicYear !== academicYear) {
        // Director has already set a new academic year - use that
        nextAcademicYear = currentPeriod.currentAcademicYear;
        
        await logProgression("info", "academic_year_sync", 
          `Using centralized academic year for progression: ${nextAcademicYear}`, {
          studentId,
          originalAcademicYear: academicYear,
          centralizedAcademicYear: currentPeriod.currentAcademicYear
        }, studentId, approvedBy);
      }

      // Create progression history record
      const historyData: Omit<ProgressionHistory, "id"> = {
        studentId: progress.studentId,
        studentName: `Student ${studentId}`, // Will be updated with actual name
        registrationNumber: studentId,
        fromLevel: progress.currentLevel,
        toLevel: newLevel,
        academicYear: academicYear,
        scheduleType: progress.scheduleType,
        progressionDate: new Date(),
        progressionType,
        approvedBy,
        reason: reason || `${progressionType} progression from Level ${progress.currentLevel} to Level ${newLevel}`,
        periodsCompleted: progress.periodsCompleted.filter(p => p.status === "completed").length,
        totalPeriods: rule.requiredPeriods,
        overallGPA: PeriodUtils.calculateOverallGPA(progress.periodsCompleted),
        creditsEarned: progress.totalCreditsEarned,
        previousProgressId: progress.id,
        createdAt: new Date(),
        notes: forceProgression ? "Forced progression - eligibility bypassed" : undefined
      };

      // Save progression history
      const historyRef = collection(db, COLLECTIONS.PROGRESSION_HISTORY);
      const historyDoc = await addDoc(historyRef, {
        ...historyData,
        progressionDate: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Update current progress record to mark as progressed
      const progressDoc = doc(db, COLLECTIONS.STUDENT_PROGRESS, progress.id);
      await updateDoc(progressDoc, {
        progressionStatus: "progressed",
        nextLevel: newLevel,
        progressionDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create new progress record for next academic year
      const newProgressData: Omit<StudentProgress, "id"> = {
        studentId: progress.studentId,
        studentEmail: progress.studentEmail,
        academicYear: nextAcademicYear,
        scheduleType: progress.scheduleType,
        currentLevel: newLevel,
        entryLevel: progress.entryLevel, // Keep original entry level
        periodsCompleted: [], // Start fresh for new academic year
        progressionStatus: "not-eligible", // Will become eligible as they complete periods
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: approvedBy || "system-progression"
      };

      const newProgressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
      const newProgressDoc = await addDoc(newProgressRef, {
        ...newProgressData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update progression history with new progress record ID
      await updateDoc(historyDoc, {
        newProgressId: newProgressDoc.id
      });

      await logProgression("success", "student_progressed", 
        `Student ${studentId} progressed from Level ${progress.currentLevel} to Level ${newLevel}`, {
        progressionType,
        fromLevel: progress.currentLevel,
        toLevel: newLevel,
        academicYear,
        nextAcademicYear,
        historyId: historyDoc.id,
        newProgressId: newProgressDoc.id
      }, studentId, approvedBy);

      console.log(`✅ Successfully progressed student ${studentId} from Level ${progress.currentLevel} to Level ${newLevel}`);

      return {
        success: true,
        message: `Student successfully progressed from Level ${progress.currentLevel} to Level ${newLevel}`,
        historyId: historyDoc.id
      };

    } catch (error) {
      console.error(`Error processing progression for student ${studentId}:`, error);
      
      await logProgression("error", "progression_failed", 
        `Failed to progress student ${studentId}: ${error}`, 
        { error: error instanceof Error ? error.message : 'Unknown error' }, studentId, approvedBy);

      return {
        success: false,
        message: `Progression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process batch progression for multiple students
   */
  static async processBatchProgression(
    academicYear: string,
    scheduleType: "Regular" | "Weekend",
    progressionType: "automatic" | "manual" = "automatic",
    approvedBy?: string,
    dryRun: boolean = false
  ): Promise<{ batchId?: string; results: any; summary: any }> {
    console.log(`🎯 Processing batch progression for ${scheduleType} students in ${academicYear} (${progressionType})`);
    
    try {
      // Create batch record
      const batchName = `${scheduleType} Students Progression - ${academicYear}`;
      const batchData: Omit<ProgressionBatch, "id"> = {
        batchName,
        academicYear,
        scheduleType,
        progressionDate: new Date(),
        processedBy: approvedBy,
        totalStudents: 0,
        eligibleStudents: 0,
        progressedStudents: 0,
        failedProgressions: 0,
        manualReviewRequired: 0,
        status: dryRun ? "pending" : "processing",
        progressionResults: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: dryRun ? "Dry run - no actual progressions performed" : undefined
      };

      const batchRef = collection(db, COLLECTIONS.PROGRESSION_BATCHES);
      const batchDoc = await addDoc(batchRef, {
        ...batchData,
        progressionDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const batchId = batchDoc.id;
      
      await logProgression("info", "batch_progression_started", 
        `Started batch progression for ${scheduleType} students in ${academicYear}`, {
        batchId,
        scheduleType,
        academicYear,
        progressionType,
        dryRun
      }, undefined, approvedBy, batchId);

      // Get all students for this academic year and schedule type
      const progressRef = collection(db, COLLECTIONS.STUDENT_PROGRESS);
      const studentsQuery = query(
        progressRef,
        where("academicYear", "==", academicYear),
        where("scheduleType", "==", scheduleType),
        where("progressionStatus", "in", ["eligible", "not-eligible", "pending-review"])
      );

      const studentsSnapshot = await getDocs(studentsQuery);
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StudentProgress));

      console.log(`📊 Found ${students.length} students to process`);

      const results = [];
      let summary = {
        totalStudents: students.length,
        eligibleStudents: 0,
        progressedStudents: 0,
        failedProgressions: 0,
        manualReviewRequired: 0
      };

      // Process each student
      for (const student of students) {
        try {
          // Check eligibility
          const eligibilityCheck = await this.checkStudentEligibility(student.studentId, academicYear);
          
          if (eligibilityCheck.isEligible) {
            summary.eligibleStudents++;
            
            if (!dryRun) {
              // Actually progress the student
              const progressionResult = await this.progressStudent(
                student.studentId,
                academicYear,
                progressionType,
                approvedBy,
                `Batch progression - ${batchName}`,
                false
              );
              
              if (progressionResult.success) {
                summary.progressedStudents++;
                results.push({
                  studentId: student.studentId,
                  status: "progressed",
                  fromLevel: student.currentLevel,
                  toLevel: eligibilityCheck.nextLevel,
                  reason: "Successfully progressed"
                });
              } else {
                summary.failedProgressions++;
                results.push({
                  studentId: student.studentId,
                  status: "failed",
                  fromLevel: student.currentLevel,
                  reason: progressionResult.message
                });
              }
            } else {
              // Dry run - just record what would happen
              results.push({
                studentId: student.studentId,
                status: "would-progress",
                fromLevel: student.currentLevel,
                toLevel: eligibilityCheck.nextLevel,
                reason: "Would be progressed (dry run)"
              });
            }
          } else {
            // Not eligible - might need manual review
            if (eligibilityCheck.missingRequirements?.some(req => req.includes("partial"))) {
              summary.manualReviewRequired++;
              results.push({
                studentId: student.studentId,
                status: "manual-review",
                fromLevel: student.currentLevel,
                reason: "Requires manual review for partial progression"
              });
            } else {
              results.push({
                studentId: student.studentId,
                status: "not-eligible",
                fromLevel: student.currentLevel,
                reason: eligibilityCheck.reason
              });
            }
          }
        } catch (error) {
          summary.failedProgressions++;
          results.push({
            studentId: student.studentId,
            status: "error",
            fromLevel: student.currentLevel,
            reason: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }

      // Update batch record with results
      await updateDoc(batchDoc, {
        ...summary,
        progressionResults: results,
        status: dryRun ? "completed" : "completed",
        processedDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await logProgression("success", "batch_progression_completed", 
        `Completed batch progression for ${scheduleType} students`, {
        batchId,
        summary,
        dryRun
      }, undefined, approvedBy, batchId);

      console.log(`✅ Batch progression completed for ${scheduleType} students`);
      console.log(`📊 Summary:`, summary);

      return {
        batchId,
        results,
        summary
      };

    } catch (error) {
      console.error("Error in batch progression:", error);
      
      await logProgression("error", "batch_progression_failed", 
        `Batch progression failed for ${scheduleType} students: ${error}`, 
        { error: error instanceof Error ? error.message : 'Unknown error' }, undefined, approvedBy);

      throw error;
    }
  }

  /**
   * Update period completion for a student
   */
  static async updateStudentPeriodCompletion(
    studentId: string,
    academicYear: string,
    periodName: string,
    status: "completed" | "failed" | "pending" | "in_progress",
    grade?: string,
    gpa?: number,
    creditsEarned?: number,
    creditsAttempted?: number,
    completionDate?: Date,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    console.log(`📚 Updating period completion for student ${studentId}: ${periodName} = ${status}`);
    
    try {
      const progress = await getStudentProgress(studentId, academicYear);
      
      if (!progress) {
        return {
          success: false,
          message: "Student progress record not found"
        };
      }

      const periodCompletion: StudentPeriodCompletion = {
        period: periodName,
        status,
        grade,
        gpa,
        creditsEarned,
        creditsAttempted,
        completionDate: completionDate || (status === "completed" ? new Date() : undefined),
        notes
      };

      await updatePeriodCompletion(progress.id, periodCompletion);

      // Check if this completion makes the student eligible for progression
      const eligibilityCheck = await this.checkStudentEligibility(studentId, academicYear, true);
      
      // Update progression status if eligibility changed
      const progressDoc = doc(db, COLLECTIONS.STUDENT_PROGRESS, progress.id);
      await updateDoc(progressDoc, {
        progressionStatus: eligibilityCheck.isEligible ? "eligible" : "not-eligible",
        updatedAt: serverTimestamp()
      });

      await logProgression("info", "period_completion_updated", 
        `Updated ${periodName} completion for student ${studentId}: ${status}`, {
        studentId,
        period: periodName,
        status,
        grade,
        isNowEligible: eligibilityCheck.isEligible
      }, studentId);

      return {
        success: true,
        message: `Period completion updated successfully. Student is ${eligibilityCheck.isEligible ? 'now eligible' : 'not yet eligible'} for progression.`
      };

    } catch (error) {
      console.error("Error updating period completion:", error);
      
      await logProgression("error", "period_completion_update_failed", 
        `Failed to update period completion for student ${studentId}: ${error}`, 
        { error: error instanceof Error ? error.message : 'Unknown error' }, studentId);

      return {
        success: false,
        message: `Failed to update period completion: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get progression schedule for current academic year
   */
  static async getProgressionSchedule(): Promise<{
    regular: { nextDate: Date; daysUntil: number; isTime: boolean };
    weekend: { nextDate: Date; daysUntil: number; isTime: boolean };
  }> {
    const currentDate = new Date();
    
    return {
      regular: {
        nextDate: ProgressionTimingUtils.getNextProgressionDate("Regular", currentDate),
        daysUntil: ProgressionTimingUtils.getDaysUntilProgression("Regular", currentDate),
        isTime: ProgressionTimingUtils.isProgressionTime("Regular", currentDate)
      },
      weekend: {
        nextDate: ProgressionTimingUtils.getNextProgressionDate("Weekend", currentDate),
        daysUntil: ProgressionTimingUtils.getDaysUntilProgression("Weekend", currentDate),
        isTime: ProgressionTimingUtils.isProgressionTime("Weekend", currentDate)
      }
    };
  }
}

export default ProgressionEngine;
