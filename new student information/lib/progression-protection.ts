/**
 * Progression Protection Engine
 * Phase 3: Ensures safe progression that never disrupts active academic periods
 */

import { AcademicIntegrationService, type CentralizedAcademicPeriod } from "./academic-integration";
import { logProgression } from "./progression-service";

/**
 * Protection levels for progression safety
 */
export type ProtectionLevel = "strict" | "moderate" | "permissive";

/**
 * Protection check result
 */
export interface ProtectionCheckResult {
  isAllowed: boolean;
  protectionLevel: ProtectionLevel;
  blockingFactors: string[];
  warnings: string[];
  recommendations: string[];
  safeProgressionDate?: Date;
  academicYearStatus: {
    current: string;
    hasActiveSemesters: boolean;
    hasActiveRegistrations: boolean;
    hasPendingGrades: boolean;
  };
}

/**
 * Academic Year Transition Monitor
 */
export interface AcademicYearTransition {
  isTransition: boolean;
  previousYear?: string;
  currentYear: string;
  transitionDate: Date;
  transitionType: "new_year" | "rollback" | "same_year";
  triggerProgression: boolean;
}

/**
 * Progression Protection Engine
 * Implements "Academic Year Boundary Only" protection
 */
export class ProgressionProtectionEngine {

  /**
   * Core protection principle: Only allow progression during academic year transitions
   */
  static async checkProgressionProtection(
    academicYear: string,
    protectionLevel: ProtectionLevel = "strict"
  ): Promise<ProtectionCheckResult> {
    console.log(`🛡️ Checking progression protection for ${academicYear} (${protectionLevel} mode)`);

    try {
      const currentPeriod = await AcademicIntegrationService.getCurrentAcademicPeriod();
      
      if (!currentPeriod) {
        return this.createBlockedResult(
          "strict",
          ["No current academic period found in centralized system"],
          [],
          ["Configure current academic period in Academic Affairs system"]
        );
      }

      // Check academic year status
      const academicYearStatus = await this.checkAcademicYearStatus(currentPeriod);
      
      // Apply protection rules based on level
      const protectionResult = await this.applyProtectionRules(
        currentPeriod,
        academicYearStatus,
        protectionLevel
      );

      // Log protection check
      await logProgression("info", "progression_protection_check", 
        `Protection check: ${protectionResult.isAllowed ? 'ALLOWED' : 'BLOCKED'}`, {
        academicYear,
        protectionLevel,
        currentPeriod: currentPeriod.currentAcademicYear,
        blockingFactors: protectionResult.blockingFactors,
        academicYearStatus
      });

      return protectionResult;

    } catch (error) {
      console.error("Error in progression protection check:", error);
      
      await logProgression("error", "progression_protection_error", 
        `Protection check failed: ${error}`, { academicYear, error: error instanceof Error ? error.message : 'Unknown error' });

      return this.createBlockedResult(
        protectionLevel,
        [`System error during protection check: ${error instanceof Error ? error.message : 'Unknown error'}`],
        [],
        ["Contact system administrator to resolve protection check issues"]
      );
    }
  }

  /**
   * Monitor academic year transitions
   */
  static async monitorAcademicYearTransition(
    previousPeriod: CentralizedAcademicPeriod | null,
    currentPeriod: CentralizedAcademicPeriod
  ): Promise<AcademicYearTransition> {
    const transition: AcademicYearTransition = {
      isTransition: false,
      currentYear: currentPeriod.currentAcademicYear,
      transitionDate: new Date(),
      transitionType: "same_year",
      triggerProgression: false
    };

    if (!previousPeriod) {
      // First time loading - no transition
      return transition;
    }

    if (previousPeriod.currentAcademicYear !== currentPeriod.currentAcademicYear) {
      // Academic year has changed!
      transition.isTransition = true;
      transition.previousYear = previousPeriod.currentAcademicYear;
      
      // Determine transition type
      const transitionDetection = await AcademicIntegrationService.detectAcademicYearTransition(
        previousPeriod.currentAcademicYear,
        currentPeriod.currentAcademicYear
      );

      transition.transitionType = transitionDetection.transitionType;
      
      // Only trigger progression for forward transitions
      if (transitionDetection.transitionType === "new_year" && transitionDetection.isSafeForProgression) {
        transition.triggerProgression = true;
        
        await logProgression("info", "academic_year_transition", 
          `Academic year transition detected: ${transition.previousYear} → ${transition.currentYear}`, {
          previousYear: transition.previousYear,
          currentYear: transition.currentYear,
          transitionType: transition.transitionType,
          willTriggerProgression: true
        });
      } else {
        await logProgression("warning", "academic_year_transition", 
          `Academic year transition detected but progression not triggered: ${transition.previousYear} → ${transition.currentYear}`, {
          previousYear: transition.previousYear,
          currentYear: transition.currentYear,
          transitionType: transition.transitionType,
          willTriggerProgression: false
        });
      }
    }

    return transition;
  }

  /**
   * Check the status of the current academic year
   */
  private static async checkAcademicYearStatus(
    currentPeriod: CentralizedAcademicPeriod
  ): Promise<{
    current: string;
    hasActiveSemesters: boolean;
    hasActiveRegistrations: boolean;
    hasPendingGrades: boolean;
  }> {
    // Get safety check from academic integration service
    const safetyCheck = await AcademicIntegrationService.checkProgressionSafety(
      currentPeriod.currentAcademicYear
    );

    return {
      current: currentPeriod.currentAcademicYear,
      hasActiveSemesters: safetyCheck.reasons.some(r => r.includes("active semester")),
      hasActiveRegistrations: safetyCheck.reasons.some(r => r.includes("active course registrations")),
      hasPendingGrades: safetyCheck.warnings.some(w => w.includes("pending"))
    };
  }

  /**
   * Apply protection rules based on protection level
   */
  private static async applyProtectionRules(
    currentPeriod: CentralizedAcademicPeriod,
    academicYearStatus: any,
    protectionLevel: ProtectionLevel
  ): Promise<ProtectionCheckResult> {
    const blockingFactors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // STRICT PROTECTION (Default - maximum safety)
    if (protectionLevel === "strict") {
      // Block if any academic activity is ongoing
      if (academicYearStatus.hasActiveSemesters) {
        blockingFactors.push("Active semesters exist - progression blocked to protect course registrations");
        recommendations.push("Wait for all semesters to complete before progression");
      }

      if (academicYearStatus.hasActiveRegistrations) {
        blockingFactors.push("Active course registrations exist - progression blocked to protect student records");
        recommendations.push("Complete all course registrations and grade submissions");
      }

      if (academicYearStatus.hasPendingGrades) {
        blockingFactors.push("Pending grades detected - progression blocked to protect academic records");
        recommendations.push("Ensure all grades are submitted and finalized");
      }

      // Additional strict checks
      const today = new Date();
      const isWithinAcademicYear = await this.isWithinAcademicYearPeriod(currentPeriod.currentAcademicYear);
      
      if (isWithinAcademicYear) {
        blockingFactors.push("Currently within active academic year period - progression only allowed between academic years");
        recommendations.push("Wait for academic year to complete and transition to new year");
      }
    }

    // MODERATE PROTECTION (Some flexibility)
    else if (protectionLevel === "moderate") {
      if (academicYearStatus.hasActiveSemesters) {
        warnings.push("Active semesters exist - proceed with caution");
        recommendations.push("Verify all academic activities are properly handled");
      }

      if (academicYearStatus.hasActiveRegistrations) {
        blockingFactors.push("Active course registrations exist - progression blocked");
        recommendations.push("Complete course registrations before progression");
      }

      if (academicYearStatus.hasPendingGrades) {
        warnings.push("Pending grades detected - ensure completion before progression");
      }
    }

    // PERMISSIVE PROTECTION (Emergency override - use with extreme caution)
    else if (protectionLevel === "permissive") {
      if (academicYearStatus.hasActiveSemesters) {
        warnings.push("WARNING: Active semesters exist - progression may disrupt academic activities");
      }

      if (academicYearStatus.hasActiveRegistrations) {
        warnings.push("WARNING: Active course registrations exist - progression may cause data inconsistencies");
      }

      if (academicYearStatus.hasPendingGrades) {
        warnings.push("WARNING: Pending grades exist - progression may affect grading process");
      }

      recommendations.push("EMERGENCY MODE: Verify all downstream systems after progression");
      recommendations.push("Monitor course registration, grading, and results systems closely");
    }

    // Determine if progression is allowed
    const isAllowed = blockingFactors.length === 0;

    // Calculate safe progression date if blocked
    let safeProgressionDate: Date | undefined;
    if (!isAllowed) {
      safeProgressionDate = await this.calculateSafeProgressionDate(currentPeriod.currentAcademicYear);
    }

    return {
      isAllowed,
      protectionLevel,
      blockingFactors,
      warnings,
      recommendations,
      safeProgressionDate,
      academicYearStatus
    };
  }

  /**
   * Check if we're currently within an active academic year period
   */
  private static async isWithinAcademicYearPeriod(academicYear: string): Promise<boolean> {
    try {
      // Get the academic year details
      const currentPeriod = await AcademicIntegrationService.getCurrentAcademicPeriod();
      if (!currentPeriod?.currentAcademicYearId) {
        return false;
      }

      const yearDetails = await AcademicIntegrationService.getAcademicYear(currentPeriod.currentAcademicYearId);
      if (!yearDetails) {
        return false;
      }

      const today = new Date();
      return today >= yearDetails.startDate && today <= yearDetails.endDate;
    } catch (error) {
      console.error("Error checking academic year period:", error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Calculate the next safe date for progression
   */
  private static async calculateSafeProgressionDate(academicYear: string): Promise<Date> {
    try {
      const currentPeriod = await AcademicIntegrationService.getCurrentAcademicPeriod();
      if (!currentPeriod?.currentAcademicYearId) {
        // Default to 6 months from now if we can't determine
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        return futureDate;
      }

      const yearDetails = await AcademicIntegrationService.getAcademicYear(currentPeriod.currentAcademicYearId);
      if (!yearDetails) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        return futureDate;
      }

      // Safe progression date is 30 days after academic year ends
      const safeDate = new Date(yearDetails.endDate);
      safeDate.setDate(safeDate.getDate() + 30);
      
      return safeDate;
    } catch (error) {
      console.error("Error calculating safe progression date:", error);
      
      // Default to 6 months from now
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      return futureDate;
    }
  }

  /**
   * Create a blocked result
   */
  private static createBlockedResult(
    protectionLevel: ProtectionLevel,
    blockingFactors: string[],
    warnings: string[],
    recommendations: string[]
  ): ProtectionCheckResult {
    return {
      isAllowed: false,
      protectionLevel,
      blockingFactors,
      warnings,
      recommendations,
      academicYearStatus: {
        current: "unknown",
        hasActiveSemesters: true, // Assume the worst for safety
        hasActiveRegistrations: true,
        hasPendingGrades: true
      }
    };
  }

  /**
   * Emergency override for critical situations
   */
  static async emergencyOverride(
    reason: string,
    authorizedBy: string,
    acknowledgments: string[]
  ): Promise<{ success: boolean; overrideToken: string; expiresAt: Date }> {
    const overrideToken = `EMERGENCY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour emergency window

    await logProgression("warning", "emergency_override", 
      `EMERGENCY OVERRIDE ACTIVATED: ${reason}`, {
      reason,
      authorizedBy,
      acknowledgments,
      overrideToken,
      expiresAt: expiresAt.toISOString()
    }, undefined, authorizedBy);

    console.warn(`🚨 EMERGENCY OVERRIDE ACTIVATED by ${authorizedBy}: ${reason}`);
    console.warn(`🔑 Override Token: ${overrideToken}`);
    console.warn(`⏰ Expires: ${expiresAt.toISOString()}`);

    return {
      success: true,
      overrideToken,
      expiresAt
    };
  }

  /**
   * Get protection status summary
   */
  static async getProtectionStatus(): Promise<{
    isProtectionActive: boolean;
    currentAcademicYear: string;
    protectionLevel: ProtectionLevel;
    lastCheck: Date;
    safetyStatus: "safe" | "warning" | "blocked";
    nextSafeDate?: Date;
  }> {
    try {
      const currentPeriod = await AcademicIntegrationService.getCurrentAcademicPeriod();
      
      if (!currentPeriod) {
        return {
          isProtectionActive: true,
          currentAcademicYear: "unknown",
          protectionLevel: "strict",
          lastCheck: new Date(),
          safetyStatus: "blocked"
        };
      }

      const protectionCheck = await this.checkProgressionProtection(
        currentPeriod.currentAcademicYear,
        "strict"
      );

      return {
        isProtectionActive: true,
        currentAcademicYear: currentPeriod.currentAcademicYear,
        protectionLevel: "strict",
        lastCheck: new Date(),
        safetyStatus: protectionCheck.isAllowed ? "safe" : 
                     protectionCheck.warnings.length > 0 ? "warning" : "blocked",
        nextSafeDate: protectionCheck.safeProgressionDate
      };

    } catch (error) {
      console.error("Error getting protection status:", error);
      
      return {
        isProtectionActive: true,
        currentAcademicYear: "unknown",
        protectionLevel: "strict",
        lastCheck: new Date(),
        safetyStatus: "blocked"
      };
    }
  }
}

export default ProgressionProtectionEngine;




