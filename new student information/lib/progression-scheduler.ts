/**
 * Automated Progression Scheduler
 * Phase 2: Handles scheduled progression events and automation
 */

import { ProgressionEngine } from "./progression-engine";
import { PeriodTracker } from "./period-tracker";
import { 
  getProgressionRules, 
  getProgressionSummary,
  logProgression 
} from "./progression-service";
import { 
  ProgressionTimingUtils,
  AcademicYearUtils 
} from "./progression-utils";

/**
 * Progression Scheduler - Handles automated progression timing
 */
export class ProgressionScheduler {

  /**
   * Check if it's time to run progression for any schedule type
   */
  static async checkProgressionTime(): Promise<{
    shouldRunRegular: boolean;
    shouldRunWeekend: boolean;
    currentDate: Date;
    schedule: {
      regular: { nextDate: Date; daysUntil: number; isTime: boolean };
      weekend: { nextDate: Date; daysUntil: number; isTime: boolean };
    };
  }> {
    const currentDate = new Date();
    
    const schedule = await ProgressionEngine.getProgressionSchedule();
    
    const shouldRunRegular = ProgressionTimingUtils.isProgressionTime("Regular", currentDate);
    const shouldRunWeekend = ProgressionTimingUtils.isProgressionTime("Weekend", currentDate);

    await logProgression("info", "progression_time_check", 
      `Checked progression timing`, {
      currentDate: currentDate.toISOString(),
      shouldRunRegular,
      shouldRunWeekend,
      schedule
    });

    return {
      shouldRunRegular,
      shouldRunWeekend,
      currentDate,
      schedule
    };
  }

  /**
   * Run scheduled progression check and processing
   */
  static async runScheduledProgression(
    dryRun: boolean = false,
    forceRun: boolean = false
  ): Promise<{
    executed: boolean;
    results: {
      regular?: any;
      weekend?: any;
    };
    summary: string;
  }> {
    console.log(`🕐 Running scheduled progression check (dryRun: ${dryRun}, force: ${forceRun})`);

    try {
      const timingCheck = await this.checkProgressionTime();
      
      if (!forceRun && !timingCheck.shouldRunRegular && !timingCheck.shouldRunWeekend) {
        return {
          executed: false,
          results: {},
          summary: `No progression scheduled for today. Next: Regular (${timingCheck.schedule.regular.daysUntil} days), Weekend (${timingCheck.schedule.weekend.daysUntil} days)`
        };
      }

      const results: any = {};
      const currentYear = timingCheck.currentDate.getFullYear();
      
      // Determine which academic year we're processing
      // For Regular students progressing in September: completing 2024/2025, moving to 2025/2026
      // For Weekend students progressing in October: completing 2024/2025, moving to 2025/2026
      let academicYearToComplete: string;

      if (timingCheck.shouldRunRegular || forceRun) {
        // Regular students progress in September
        if (timingCheck.currentDate.getMonth() + 1 >= 9) {
          // September or later - completing current academic year
          academicYearToComplete = `${currentYear}/${currentYear + 1}`;
        } else {
          // Before September - completing previous academic year
          academicYearToComplete = `${currentYear - 1}/${currentYear}`;
        }

        console.log(`🎓 Processing Regular student progression for completed academic year: ${academicYearToComplete}`);

        await logProgression("info", "scheduled_progression_start", 
          `Starting scheduled progression for Regular students`, {
          academicYear: academicYearToComplete,
          dryRun,
          forceRun
        });

        // Auto-complete any pending periods first
        const autoCompleteResult = await PeriodTracker.autoCompletePeriods(
          academicYearToComplete, 
          "Regular", 
          dryRun
        );

        console.log(`📚 Auto-completed periods for Regular students:`, autoCompleteResult);

        // Run batch progression
        const progressionResult = await ProgressionEngine.processBatchProgression(
          academicYearToComplete,
          "Regular",
          "automatic",
          "system-scheduler",
          dryRun
        );

        results.regular = {
          academicYear: academicYearToComplete,
          autoCompletion: autoCompleteResult,
          progression: progressionResult
        };
      }

      if (timingCheck.shouldRunWeekend || forceRun) {
        // Weekend students progress in October
        if (timingCheck.currentDate.getMonth() + 1 >= 10) {
          // October or later - completing current academic year
          academicYearToComplete = `${currentYear}/${currentYear + 1}`;
        } else {
          // Before October - completing previous academic year
          academicYearToComplete = `${currentYear - 1}/${currentYear}`;
        }

        console.log(`🎓 Processing Weekend student progression for completed academic year: ${academicYearToComplete}`);

        await logProgression("info", "scheduled_progression_start", 
          `Starting scheduled progression for Weekend students`, {
          academicYear: academicYearToComplete,
          dryRun,
          forceRun
        });

        // Auto-complete any pending periods first
        const autoCompleteResult = await PeriodTracker.autoCompletePeriods(
          academicYearToComplete, 
          "Weekend", 
          dryRun
        );

        console.log(`📚 Auto-completed periods for Weekend students:`, autoCompleteResult);

        // Run batch progression
        const progressionResult = await ProgressionEngine.processBatchProgression(
          academicYearToComplete,
          "Weekend",
          "automatic",
          "system-scheduler",
          dryRun
        );

        results.weekend = {
          academicYear: academicYearToComplete,
          autoCompletion: autoCompleteResult,
          progression: progressionResult
        };
      }

      // Generate summary
      let summary = "Scheduled progression completed:\n";
      
      if (results.regular) {
        const reg = results.regular.progression.summary;
        summary += `Regular Students (${results.regular.academicYear}): ${reg.progressedStudents}/${reg.totalStudents} progressed\n`;
      }
      
      if (results.weekend) {
        const wkd = results.weekend.progression.summary;
        summary += `Weekend Students (${results.weekend.academicYear}): ${wkd.progressedStudents}/${wkd.totalStudents} progressed\n`;
      }

      await logProgression("success", "scheduled_progression_completed", 
        `Completed scheduled progression`, {
        results,
        summary,
        dryRun
      });

      return {
        executed: true,
        results,
        summary
      };

    } catch (error) {
      const errorMsg = `Error in scheduled progression: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      
      await logProgression("error", "scheduled_progression_failed", errorMsg, {
        error: errorMsg,
        dryRun,
        forceRun
      });

      throw error;
    }
  }

  /**
   * Preview upcoming progressions
   */
  static async previewUpcomingProgressions(): Promise<{
    regular: {
      nextDate: Date;
      daysUntil: number;
      academicYear: string;
      eligibleStudents: number;
      totalStudents: number;
    };
    weekend: {
      nextDate: Date;
      daysUntil: number;
      academicYear: string;
      eligibleStudents: number;
      totalStudents: number;
    };
  }> {
    console.log("🔮 Previewing upcoming progressions");

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Calculate academic years that will be completed
    const regularNextDate = ProgressionTimingUtils.getNextProgressionDate("Regular", currentDate);
    const weekendNextDate = ProgressionTimingUtils.getNextProgressionDate("Weekend", currentDate);
    
    // Determine academic year that will be completed for each type
    const regularAcademicYear = regularNextDate.getMonth() >= 8 ? 
      `${regularNextDate.getFullYear()}/${regularNextDate.getFullYear() + 1}` :
      `${regularNextDate.getFullYear() - 1}/${regularNextDate.getFullYear()}`;
      
    const weekendAcademicYear = weekendNextDate.getMonth() >= 9 ? 
      `${weekendNextDate.getFullYear()}/${weekendNextDate.getFullYear() + 1}` :
      `${weekendNextDate.getFullYear() - 1}/${weekendNextDate.getFullYear()}`;

    // Get current progression summaries
    let regularSummary, weekendSummary;
    
    try {
      regularSummary = await getProgressionSummary(regularAcademicYear);
    } catch (error) {
      console.log(`No data found for Regular students in ${regularAcademicYear}`);
      regularSummary = { totalStudents: 0, eligibleForProgression: 0 };
    }
    
    try {
      weekendSummary = await getProgressionSummary(weekendAcademicYear);
    } catch (error) {
      console.log(`No data found for Weekend students in ${weekendAcademicYear}`);
      weekendSummary = { totalStudents: 0, eligibleForProgression: 0 };
    }

    return {
      regular: {
        nextDate: regularNextDate,
        daysUntil: ProgressionTimingUtils.getDaysUntilProgression("Regular", currentDate),
        academicYear: regularAcademicYear,
        eligibleStudents: regularSummary.eligibleForProgression,
        totalStudents: regularSummary.totalStudents
      },
      weekend: {
        nextDate: weekendNextDate,
        daysUntil: ProgressionTimingUtils.getDaysUntilProgression("Weekend", currentDate),
        academicYear: weekendAcademicYear,
        eligibleStudents: weekendSummary.eligibleForProgression,
        totalStudents: weekendSummary.totalStudents
      }
    };
  }

  /**
   * Manual progression trigger (with safety checks)
   */
  static async manualProgressionTrigger(
    scheduleType: "Regular" | "Weekend",
    academicYear: string,
    triggeredBy: string,
    bypassSafetyChecks: boolean = false,
    dryRun: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
    results?: any;
  }> {
    console.log(`🔧 Manual progression trigger: ${scheduleType} students in ${academicYear}`);

    try {
      // Safety checks (unless bypassed)
      if (!bypassSafetyChecks) {
        const currentDate = new Date();
        const isProgressionTime = ProgressionTimingUtils.isProgressionTime(scheduleType, currentDate);
        
        if (!isProgressionTime) {
          const nextDate = ProgressionTimingUtils.getNextProgressionDate(scheduleType, currentDate);
          const daysUntil = ProgressionTimingUtils.getDaysUntilProgression(scheduleType, currentDate);
          
          return {
            success: false,
            message: `Safety check failed: Not scheduled progression time for ${scheduleType} students. Next progression: ${nextDate.toDateString()} (${daysUntil} days)`
          };
        }
      }

      await logProgression("warning", "manual_progression_triggered", 
        `Manual progression triggered for ${scheduleType} students`, {
        scheduleType,
        academicYear,
        triggeredBy,
        bypassSafetyChecks,
        dryRun
      }, undefined, triggeredBy);

      // Auto-complete periods first
      const autoCompleteResult = await PeriodTracker.autoCompletePeriods(
        academicYear,
        scheduleType,
        dryRun
      );

      // Run progression
      const progressionResult = await ProgressionEngine.processBatchProgression(
        academicYear,
        scheduleType,
        "manual",
        triggeredBy,
        dryRun
      );

      await logProgression("success", "manual_progression_completed", 
        `Manual progression completed for ${scheduleType} students`, {
        academicYear,
        autoCompleteResult,
        progressionResult,
        triggeredBy
      }, undefined, triggeredBy);

      return {
        success: true,
        message: `Manual progression completed successfully for ${scheduleType} students in ${academicYear}`,
        results: {
          autoCompletion: autoCompleteResult,
          progression: progressionResult
        }
      };

    } catch (error) {
      const errorMsg = `Manual progression failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      
      await logProgression("error", "manual_progression_failed", errorMsg, {
        scheduleType,
        academicYear,
        triggeredBy,
        error: errorMsg
      }, undefined, triggeredBy);

      return {
        success: false,
        message: errorMsg
      };
    }
  }

  /**
   * Get progression status for monitoring
   */
  static async getProgressionStatus(): Promise<{
    isProgressionSeason: boolean;
    activeProgressions: string[];
    upcomingProgressions: any;
    recentActivity: any[];
    systemHealth: {
      healthy: boolean;
      issues: string[];
    };
  }> {
    try {
      const timingCheck = await this.checkProgressionTime();
      const upcomingProgressions = await this.previewUpcomingProgressions();
      
      // Check system health
      const rules = await getProgressionRules();
      const systemHealth = {
        healthy: rules.length >= 2, // Should have both Regular and Weekend rules
        issues: [] as string[]
      };

      if (rules.length < 2) {
        systemHealth.issues.push("Missing progression rules - expected 2 (Regular and Weekend)");
      }

      const activeProgressions = [];
      if (timingCheck.shouldRunRegular) {
        activeProgressions.push("Regular student progression is due");
      }
      if (timingCheck.shouldRunWeekend) {
        activeProgressions.push("Weekend student progression is due");
      }

      return {
        isProgressionSeason: timingCheck.shouldRunRegular || timingCheck.shouldRunWeekend,
        activeProgressions,
        upcomingProgressions,
        recentActivity: [], // Could be populated from logs
        systemHealth
      };

    } catch (error) {
      console.error("Error getting progression status:", error);
      return {
        isProgressionSeason: false,
        activeProgressions: [],
        upcomingProgressions: null,
        recentActivity: [],
        systemHealth: {
          healthy: false,
          issues: [`System error: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
      };
    }
  }

  /**
   * Emergency progression halt (if something goes wrong)
   */
  static async emergencyHalt(
    reason: string,
    haltedBy: string
  ): Promise<{ success: boolean; message: string }> {
    console.log(`🚨 EMERGENCY PROGRESSION HALT: ${reason}`);

    try {
      await logProgression("error", "emergency_halt", 
        `EMERGENCY HALT: Progression system halted`, {
        reason,
        haltedBy,
        timestamp: new Date().toISOString()
      }, undefined, haltedBy);

      // In a real implementation, this would:
      // 1. Stop any running progression batches
      // 2. Mark system as halted
      // 3. Send alerts to administrators
      // 4. Prevent new progressions from starting

      return {
        success: true,
        message: `Progression system halted successfully. Reason: ${reason}`
      };

    } catch (error) {
      console.error("Error during emergency halt:", error);
      return {
        success: false,
        message: `Failed to halt system: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export default ProgressionScheduler;





