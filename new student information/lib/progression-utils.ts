/**
 * Student Level Progression Utilities
 * Phase 1: Foundation - Helper functions and utilities
 */

import { ProgressionRule, StudentProgress, StudentPeriodCompletion } from "./progression-types";

/**
 * Academic year utilities
 */
export class AcademicYearUtils {
  /**
   * Parse academic year string to get start and end years
   * @param academicYear "2024/2025"
   * @returns { startYear: 2024, endYear: 2025 }
   */
  static parseAcademicYear(academicYear: string): { startYear: number; endYear: number } {
    const [startStr, endStr] = academicYear.split('/');
    return {
      startYear: parseInt(startStr),
      endYear: parseInt(endStr)
    };
  }

  /**
   * Get next academic year
   * @param academicYear "2024/2025"
   * @returns "2025/2026"
   */
  static getNextAcademicYear(academicYear: string): string {
    const { startYear, endYear } = this.parseAcademicYear(academicYear);
    return `${endYear}/${endYear + 1}`;
  }

  /**
   * Get previous academic year
   * @param academicYear "2024/2025"  
   * @returns "2023/2024"
   */
  static getPreviousAcademicYear(academicYear: string): string {
    const { startYear, endYear } = this.parseAcademicYear(academicYear);
    return `${startYear - 1}/${startYear}`;
  }

  /**
   * Check if academic year is current based on date
   * @param academicYear "2024/2025"
   * @param scheduleType "Regular" | "Weekend"
   * @returns boolean
   */
  static isCurrentAcademicYear(
    academicYear: string, 
    scheduleType: "Regular" | "Weekend",
    currentDate: Date = new Date()
  ): boolean {
    const { startYear, endYear } = this.parseAcademicYear(academicYear);
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    if (scheduleType === "Regular") {
      // Regular: September to May
      if (currentMonth >= 9) {
        // Sep-Dec: should be in startYear
        return currentYear === startYear;
      } else {
        // Jan-May: should be in endYear  
        return currentYear === endYear;
      }
    } else {
      // Weekend: October to August
      if (currentMonth >= 10) {
        // Oct-Dec: should be in startYear
        return currentYear === startYear;
      } else {
        // Jan-Aug: should be in endYear
        return currentYear === endYear;
      }
    }
  }

  /**
   * Get academic year for a given date
   * @param date Date to check
   * @param scheduleType "Regular" | "Weekend"
   * @returns "2024/2025"
   */
  static getAcademicYearForDate(
    date: Date, 
    scheduleType: "Regular" | "Weekend"
  ): string {
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    if (scheduleType === "Regular") {
      // Regular: September to May
      if (month >= 9) {
        // Sep-Dec: academic year starts this year
        return `${year}/${year + 1}`;
      } else {
        // Jan-May: academic year started last year
        return `${year - 1}/${year}`;
      }
    } else {
      // Weekend: October to August  
      if (month >= 10) {
        // Oct-Dec: academic year starts this year
        return `${year}/${year + 1}`;
      } else {
        // Jan-Aug: academic year started last year
        return `${year - 1}/${year}`;
      }
    }
  }
}

/**
 * Level progression utilities
 */
export class LevelUtils {
  /**
   * Get next level
   * @param currentLevel "200"
   * @returns "300"
   */
  static getNextLevel(currentLevel: string): string {
    const levelNum = parseInt(currentLevel);
    return (levelNum + 100).toString();
  }

  /**
   * Get previous level
   * @param currentLevel "300"
   * @returns "200"
   */
  static getPreviousLevel(currentLevel: string): string {
    const levelNum = parseInt(currentLevel);
    return Math.max(100, levelNum - 100).toString();
  }

  /**
   * Check if level is valid
   * @param level "200"
   * @returns boolean
   */
  static isValidLevel(level: string): boolean {
    const levelNum = parseInt(level);
    return !isNaN(levelNum) && levelNum >= 100 && levelNum <= 400 && levelNum % 100 === 0;
  }

  /**
   * Get all possible levels
   * @returns ["100", "200", "300", "400"]
   */
  static getAllLevels(): string[] {
    return ["100", "200", "300", "400"];
  }

  /**
   * Get level display name
   * @param level "200"
   * @returns "Level 200"
   */
  static getLevelDisplayName(level: string): string {
    return `Level ${level}`;
  }

  /**
   * Check if student can progress from current level
   * @param currentLevel "400"
   * @returns boolean
   */
  static canProgressFromLevel(currentLevel: string): boolean {
    const levelNum = parseInt(currentLevel);
    return levelNum < 400; // Can't progress beyond Level 400
  }
}

/**
 * Period completion utilities
 */
export class PeriodUtils {
  /**
   * Calculate completion percentage
   * @param periodsCompleted StudentPeriodCompletion[]
   * @param requiredPeriods number
   * @returns number (0-100)
   */
  static calculateCompletionPercentage(
    periodsCompleted: StudentPeriodCompletion[],
    requiredPeriods: number
  ): number {
    const completed = periodsCompleted.filter(p => p.status === "completed").length;
    return Math.round((completed / requiredPeriods) * 100);
  }

  /**
   * Get period status summary
   * @param periodsCompleted StudentPeriodCompletion[]
   * @returns object with counts
   */
  static getPeriodStatusSummary(periodsCompleted: StudentPeriodCompletion[]) {
    return {
      completed: periodsCompleted.filter(p => p.status === "completed").length,
      failed: periodsCompleted.filter(p => p.status === "failed").length,
      pending: periodsCompleted.filter(p => p.status === "pending").length,
      inProgress: periodsCompleted.filter(p => p.status === "in_progress").length,
      total: periodsCompleted.length
    };
  }

  /**
   * Calculate overall GPA from periods
   * @param periodsCompleted StudentPeriodCompletion[]
   * @returns number | null
   */
  static calculateOverallGPA(periodsCompleted: StudentPeriodCompletion[]): number | null {
    const periodsWithGPA = periodsCompleted.filter(p => p.gpa !== undefined && p.gpa !== null);
    
    if (periodsWithGPA.length === 0) {
      return null;
    }

    const totalGPA = periodsWithGPA.reduce((sum, period) => sum + (period.gpa || 0), 0);
    return Math.round((totalGPA / periodsWithGPA.length) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get required period names for schedule type
   * @param scheduleType "Regular" | "Weekend"
   * @returns string[]
   */
  static getRequiredPeriodNames(scheduleType: "Regular" | "Weekend"): string[] {
    if (scheduleType === "Regular") {
      return ["First Semester", "Second Semester"];
    } else {
      return ["First Trimester", "Second Trimester", "Third Trimester"];
    }
  }

  /**
   * Check if all required periods are completed
   * @param periodsCompleted StudentPeriodCompletion[]
   * @param scheduleType "Regular" | "Weekend"
   * @returns boolean
   */
  static areAllPeriodsCompleted(
    periodsCompleted: StudentPeriodCompletion[],
    scheduleType: "Regular" | "Weekend"
  ): boolean {
    const requiredPeriods = this.getRequiredPeriodNames(scheduleType);
    const completedPeriodNames = periodsCompleted
      .filter(p => p.status === "completed")
      .map(p => p.period);

    return requiredPeriods.every(period => completedPeriodNames.includes(period));
  }
}

/**
 * Progression timing utilities
 */
export class ProgressionTimingUtils {
  /**
   * Get next progression date for schedule type
   * @param scheduleType "Regular" | "Weekend"
   * @param fromDate Date to calculate from
   * @returns Date
   */
  static getNextProgressionDate(
    scheduleType: "Regular" | "Weekend", 
    fromDate: Date = new Date()
  ): Date {
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth() + 1; // 1-12

    if (scheduleType === "Regular") {
      // Regular students progress in September
      if (month <= 9) {
        // If we're before September, progression is this year
        return new Date(year, 8, 1); // September 1st (month is 0-indexed)
      } else {
        // If we're after September, progression is next year
        return new Date(year + 1, 8, 1);
      }
    } else {
      // Weekend students progress in October
      if (month <= 10) {
        // If we're before October, progression is this year
        return new Date(year, 9, 1); // October 1st (month is 0-indexed)
      } else {
        // If we're after October, progression is next year
        return new Date(year + 1, 9, 1);
      }
    }
  }

  /**
   * Check if it's progression time for schedule type
   * @param scheduleType "Regular" | "Weekend"
   * @param currentDate Date to check
   * @returns boolean
   */
  static isProgressionTime(
    scheduleType: "Regular" | "Weekend",
    currentDate: Date = new Date()
  ): boolean {
    const month = currentDate.getMonth() + 1; // 1-12
    const day = currentDate.getDate();

    if (scheduleType === "Regular") {
      // Regular students progress on September 1st
      return month === 9 && day >= 1;
    } else {
      // Weekend students progress on October 1st
      return month === 10 && day >= 1;
    }
  }

  /**
   * Get days until next progression
   * @param scheduleType "Regular" | "Weekend"
   * @param fromDate Date to calculate from
   * @returns number
   */
  static getDaysUntilProgression(
    scheduleType: "Regular" | "Weekend",
    fromDate: Date = new Date()
  ): number {
    const nextProgressionDate = this.getNextProgressionDate(scheduleType, fromDate);
    const diffTime = nextProgressionDate.getTime() - fromDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate progression rule
   * @param rule ProgressionRule
   * @returns { isValid: boolean, errors: string[] }
   */
  static validateProgressionRule(rule: Partial<ProgressionRule>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.scheduleType || !["Regular", "Weekend"].includes(rule.scheduleType)) {
      errors.push("Schedule type must be 'Regular' or 'Weekend'");
    }

    if (!rule.requiredPeriods || rule.requiredPeriods < 1 || rule.requiredPeriods > 3) {
      errors.push("Required periods must be between 1 and 3");
    }

    if (!rule.progressionMonth || rule.progressionMonth < 1 || rule.progressionMonth > 12) {
      errors.push("Progression month must be between 1 and 12");
    }

    if (!rule.progressionDay || rule.progressionDay < 1 || rule.progressionDay > 31) {
      errors.push("Progression day must be between 1 and 31");
    }

    if (!rule.periodNames || !Array.isArray(rule.periodNames) || rule.periodNames.length === 0) {
      errors.push("Period names must be a non-empty array");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate student progress data
   * @param progress Partial<StudentProgress>
   * @returns { isValid: boolean, errors: string[] }
   */
  static validateStudentProgress(progress: Partial<StudentProgress>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!progress.studentId || typeof progress.studentId !== "string") {
      errors.push("Student ID is required and must be a string");
    }

    if (!progress.academicYear || !/^\d{4}\/\d{4}$/.test(progress.academicYear)) {
      errors.push("Academic year must be in format 'YYYY/YYYY'");
    }

    if (!progress.scheduleType || !["Regular", "Weekend"].includes(progress.scheduleType)) {
      errors.push("Schedule type must be 'Regular' or 'Weekend'");
    }

    if (!progress.currentLevel || !LevelUtils.isValidLevel(progress.currentLevel)) {
      errors.push("Current level must be a valid level (100, 200, 300, 400)");
    }

    if (!progress.entryLevel || !LevelUtils.isValidLevel(progress.entryLevel)) {
      errors.push("Entry level must be a valid level (100, 200, 300, 400)");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Format utilities
 */
export class FormatUtils {
  /**
   * Format academic year for display
   * @param academicYear "2024/2025"
   * @returns "2024/2025 Academic Year"
   */
  static formatAcademicYear(academicYear: string): string {
    return `${academicYear} Academic Year`;
  }

  /**
   * Format progression status for display
   * @param status "eligible" | "not-eligible" | "progressed" | "repeated" | "pending-review"
   * @returns string
   */
  static formatProgressionStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      "eligible": "Eligible for Progression",
      "not-eligible": "Not Eligible",
      "progressed": "Already Progressed",
      "repeated": "Repeating Level",
      "pending-review": "Pending Review"
    };

    return statusMap[status] || status;
  }

  /**
   * Format period completion status
   * @param status "completed" | "failed" | "pending" | "in_progress"
   * @returns string
   */
  static formatPeriodStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      "completed": "Completed",
      "failed": "Failed",
      "pending": "Pending",
      "in_progress": "In Progress"
    };

    return statusMap[status] || status;
  }

  /**
   * Format date for display
   * @param date Date
   * @returns string
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
  }

  /**
   * Format progression summary for display
   * @param summary { completed: number, total: number }
   * @returns string
   */
  static formatProgressionSummary(summary: { completed: number; total: number }): string {
    const percentage = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;
    return `${summary.completed}/${summary.total} (${percentage}%)`;
  }
}





