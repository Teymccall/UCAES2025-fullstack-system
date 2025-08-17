/**
 * Academic Progression Monitor
 * Phase 3: Monitors centralized academic system and triggers safe progressions
 */

import { AcademicIntegrationService, type CentralizedAcademicPeriod } from "./academic-integration";
import { ProgressionProtectionEngine, type AcademicYearTransition } from "./progression-protection";
import { ProgressionEngine } from "./progression-engine";
import { PeriodTracker } from "./period-tracker";
import { logProgression } from "./progression-service";

/**
 * Academic Progression Monitor
 * Continuously monitors the centralized academic system and safely triggers progressions
 */
export class AcademicProgressionMonitor {
  private static instance: AcademicProgressionMonitor | null = null;
  private unsubscribe: (() => void) | null = null;
  private currentPeriod: CentralizedAcademicPeriod | null = null;
  private isMonitoring = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AcademicProgressionMonitor {
    if (!this.instance) {
      this.instance = new AcademicProgressionMonitor();
    }
    return this.instance;
  }

  /**
   * Start monitoring academic year changes
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("📊 Academic progression monitor already running");
      return;
    }

    console.log("🚀 Starting Academic Progression Monitor");
    
    try {
      // Get initial academic period
      this.currentPeriod = await AcademicIntegrationService.getCurrentAcademicPeriod();
      
      await logProgression("info", "monitor_started", 
        "Academic progression monitor started", {
        initialAcademicYear: this.currentPeriod?.currentAcademicYear || "unknown",
        monitoringActive: true
      });

      // Subscribe to changes
      this.unsubscribe = AcademicIntegrationService.subscribeToAcademicPeriodChanges(
        this.handleAcademicPeriodChange.bind(this),
        this.handleMonitoringError.bind(this)
      );

      this.isMonitoring = true;
      console.log(`📊 Monitor active for academic year: ${this.currentPeriod?.currentAcademicYear || 'unknown'}`);

    } catch (error) {
      console.error("Error starting academic progression monitor:", error);
      
      await logProgression("error", "monitor_start_failed", 
        `Failed to start academic progression monitor: ${error}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    console.log("⏹️ Stopping Academic Progression Monitor");
    
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.isMonitoring = false;
    
    await logProgression("info", "monitor_stopped", 
      "Academic progression monitor stopped", {
      lastAcademicYear: this.currentPeriod?.currentAcademicYear || "unknown",
      monitoringActive: false
    });
  }

  /**
   * Handle academic period changes
   */
  private async handleAcademicPeriodChange(newPeriod: CentralizedAcademicPeriod | null): Promise<void> {
    if (!newPeriod) {
      console.warn("⚠️ Academic period became null - possible configuration issue");
      return;
    }

    try {
      console.log(`📅 Academic period change detected: ${newPeriod.currentAcademicYear}`);

      // Check for academic year transition
      const transition = await ProgressionProtectionEngine.monitorAcademicYearTransition(
        this.currentPeriod,
        newPeriod
      );

      // Update current period
      this.currentPeriod = newPeriod;

      if (transition.isTransition) {
        await this.handleAcademicYearTransition(transition);
      } else {
        await this.handleSemesterChange(newPeriod);
      }

    } catch (error) {
      console.error("Error handling academic period change:", error);
      
      await logProgression("error", "period_change_error", 
        `Error handling academic period change: ${error}`, {
        newPeriod: newPeriod?.currentAcademicYear,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle academic year transitions (potential progression trigger)
   */
  private async handleAcademicYearTransition(transition: AcademicYearTransition): Promise<void> {
    console.log(`🎓 Academic year transition: ${transition.previousYear} → ${transition.currentYear}`);

    await logProgression("info", "academic_year_transition_detected", 
      `Academic year transition detected`, {
      previousYear: transition.previousYear,
      currentYear: transition.currentYear,
      transitionType: transition.transitionType,
      shouldTriggerProgression: transition.triggerProgression
    });

    if (transition.triggerProgression && transition.previousYear) {
      console.log("🎯 Triggering automatic progression due to academic year transition");
      
      // Auto-complete periods for the completed academic year
      await this.autoCompletePreviousYearPeriods(transition.previousYear);
      
      // Process progressions for eligible students
      await this.processAutomaticProgressions(transition.previousYear, transition.currentYear);
    } else {
      console.log("📋 Academic year changed but progression not triggered", {
        transitionType: transition.transitionType,
        triggerProgression: transition.triggerProgression
      });
    }
  }

  /**
   * Handle semester/trimester changes within same academic year
   */
  private async handleSemesterChange(newPeriod: CentralizedAcademicPeriod): Promise<void> {
    console.log(`📚 Semester change detected: ${newPeriod.currentSemester}`);

    await logProgression("info", "semester_change_detected", 
      `Semester change detected`, {
      academicYear: newPeriod.currentAcademicYear,
      newSemester: newPeriod.currentSemester
    });

    // Update period completions based on semester change
    // This could mark previous semesters as completed
    await this.updatePeriodCompletionsFromSemesterChange(newPeriod);
  }

  /**
   * Auto-complete periods for the completed academic year
   */
  private async autoCompletePreviousYearPeriods(completedAcademicYear: string): Promise<void> {
    console.log(`📚 Auto-completing periods for completed academic year: ${completedAcademicYear}`);

    try {
      // Auto-complete Regular periods
      const regularResults = await PeriodTracker.autoCompletePeriods(
        completedAcademicYear,
        "Regular",
        false // Not a dry run
      );

      // Auto-complete Weekend periods  
      const weekendResults = await PeriodTracker.autoCompletePeriods(
        completedAcademicYear,
        "Weekend", 
        false // Not a dry run
      );

      await logProgression("info", "auto_complete_periods_on_transition", 
        `Auto-completed periods for academic year transition`, {
        completedAcademicYear,
        regularResults,
        weekendResults
      });

      console.log(`✅ Period auto-completion completed for ${completedAcademicYear}`);

    } catch (error) {
      console.error("Error in auto-completing periods:", error);
      
      await logProgression("error", "auto_complete_periods_failed", 
        `Failed to auto-complete periods for ${completedAcademicYear}: ${error}`, {
        completedAcademicYear,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process automatic progressions for eligible students
   */
  private async processAutomaticProgressions(
    completedAcademicYear: string,
    newAcademicYear: string
  ): Promise<void> {
    console.log(`🎓 Processing automatic progressions: ${completedAcademicYear} → ${newAcademicYear}`);

    try {
      // Check protection before proceeding
      const protectionCheck = await ProgressionProtectionEngine.checkProgressionProtection(
        completedAcademicYear,
        "strict"
      );

      if (!protectionCheck.isAllowed) {
        console.warn("🛡️ Automatic progression blocked by protection system:", protectionCheck.blockingFactors);
        
        await logProgression("warning", "automatic_progression_blocked", 
          `Automatic progression blocked by protection system`, {
          completedAcademicYear,
          newAcademicYear,
          blockingFactors: protectionCheck.blockingFactors,
          recommendations: protectionCheck.recommendations
        });
        
        return;
      }

      // Process Regular students
      const regularResults = await ProgressionEngine.processBatchProgression(
        completedAcademicYear,
        "Regular",
        "automatic",
        "academic-year-transition-monitor",
        false // Not a dry run
      );

      // Process Weekend students
      const weekendResults = await ProgressionEngine.processBatchProgression(
        completedAcademicYear,
        "Weekend",
        "automatic", 
        "academic-year-transition-monitor",
        false // Not a dry run
      );

      await logProgression("success", "automatic_progressions_completed", 
        `Automatic progressions completed for academic year transition`, {
        completedAcademicYear,
        newAcademicYear,
        regularResults,
        weekendResults
      });

      console.log(`✅ Automatic progressions completed:`, {
        regular: regularResults.summary,
        weekend: weekendResults.summary
      });

    } catch (error) {
      console.error("Error in automatic progressions:", error);
      
      await logProgression("error", "automatic_progressions_failed", 
        `Failed to process automatic progressions: ${error}`, {
        completedAcademicYear,
        newAcademicYear,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update period completions based on semester changes
   */
  private async updatePeriodCompletionsFromSemesterChange(
    newPeriod: CentralizedAcademicPeriod
  ): Promise<void> {
    // This is a placeholder for future enhancement
    // Could automatically mark previous semester as completed when a new one starts
    console.log(`📋 Semester change tracking for ${newPeriod.currentSemester} in ${newPeriod.currentAcademicYear}`);
  }

  /**
   * Handle monitoring errors
   */
  private async handleMonitoringError(error: Error): Promise<void> {
    console.error("🚨 Academic progression monitoring error:", error);
    
    await logProgression("error", "monitoring_error", 
      `Academic progression monitoring error: ${error.message}`, {
      error: error.message,
      monitoringActive: this.isMonitoring
    });

    // Could implement automatic restart logic here
    // For now, just log the error
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    currentAcademicYear: string | null;
    lastUpdate: Date | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      currentAcademicYear: this.currentPeriod?.currentAcademicYear || null,
      lastUpdate: this.currentPeriod?.lastUpdated || null
    };
  }

  /**
   * Manual trigger for testing (development only)
   */
  async manualTriggerForTesting(
    academicYear: string,
    triggerType: "semester_change" | "year_transition"
  ): Promise<void> {
    console.log(`🧪 Manual trigger for testing: ${triggerType} in ${academicYear}`);

    if (triggerType === "year_transition") {
      const transition: AcademicYearTransition = {
        isTransition: true,
        previousYear: academicYear,
        currentYear: "2025/2026", // Example next year
        transitionDate: new Date(),
        transitionType: "new_year",
        triggerProgression: true
      };

      await this.handleAcademicYearTransition(transition);
    }

    await logProgression("info", "manual_trigger_testing", 
      `Manual trigger executed for testing`, {
      academicYear,
      triggerType
    });
  }
}

export default AcademicProgressionMonitor;




