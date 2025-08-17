/**
 * Academic Integration Service
 * Phase 3: Safe integration with centralized academic year system
 */

import { 
  doc, 
  getDoc, 
  onSnapshot, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "./firebase";
import { logProgression } from "./progression-service";

// Academic system interfaces matching the centralized system
export interface CentralizedAcademicPeriod {
  currentAcademicYearId: string;
  currentAcademicYear: string; // "2024/2025"
  currentSemesterId: string | null;
  currentSemester: string | null; // "First Semester"
  lastUpdated: Date;
  updatedBy: string;
}

export interface AcademicYear {
  id: string;
  year: string; // "2024/2025" 
  name?: string; // Fallback if year field doesn't exist
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "upcoming";
}

export interface AcademicSemester {
  id: string;
  name: string; // "First Semester", "Second Semester", etc.
  academicYear: string; // Reference to academic year
  programType: "Regular" | "Weekend";
  startDate: Date;
  endDate: Date;
  registrationStart?: Date;
  registrationEnd?: Date;
  status: "active" | "completed" | "upcoming";
  number: string; // "1", "2", "3"
}

/**
 * Academic Integration Service
 * Bridges our progression system with the centralized academic system
 */
export class AcademicIntegrationService {

  /**
   * Get current academic period from centralized system
   */
  static async getCurrentAcademicPeriod(): Promise<CentralizedAcademicPeriod | null> {
    try {
      const configRef = doc(db, "systemConfig", "academicPeriod");
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const data = configSnap.data();
        return {
          currentAcademicYearId: data.currentAcademicYearId,
          currentAcademicYear: data.currentAcademicYear,
          currentSemesterId: data.currentSemesterId,
          currentSemester: data.currentSemester,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || "unknown"
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting current academic period:", error);
      return null;
    }
  }

  /**
   * Subscribe to academic period changes
   */
  static subscribeToAcademicPeriodChanges(
    onUpdate: (period: CentralizedAcademicPeriod | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    const configRef = doc(db, "systemConfig", "academicPeriod");
    
    return onSnapshot(
      configRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          onUpdate({
            currentAcademicYearId: data.currentAcademicYearId,
            currentAcademicYear: data.currentAcademicYear,
            currentSemesterId: data.currentSemesterId,
            currentSemester: data.currentSemester,
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
            updatedBy: data.updatedBy || "unknown"
          });
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error("Error in academic period subscription:", error);
        if (onError) onError(error);
      }
    );
  }

  /**
   * Get academic year details
   */
  static async getAcademicYear(yearId: string): Promise<AcademicYear | null> {
    try {
      const yearRef = doc(db, "academic-years", yearId);
      const yearSnap = await getDoc(yearRef);
      
      if (yearSnap.exists()) {
        const data = yearSnap.data();
        return {
          id: yearSnap.id,
          year: data.year || data.name || "Unknown Year",
          name: data.name,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          status: data.status || "upcoming"
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting academic year:", error);
      return null;
    }
  }

  /**
   * Get semester details
   */
  static async getSemester(semesterId: string): Promise<AcademicSemester | null> {
    try {
      const semesterRef = doc(db, "academic-semesters", semesterId);
      const semesterSnap = await getDoc(semesterRef);
      
      if (semesterSnap.exists()) {
        const data = semesterSnap.data();
        return {
          id: semesterSnap.id,
          name: data.name,
          academicYear: data.academicYear,
          programType: data.programType || "Regular",
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          registrationStart: data.registrationStart?.toDate(),
          registrationEnd: data.registrationEnd?.toDate(),
          status: data.status || "upcoming",
          number: data.number || "1"
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting semester:", error);
      return null;
    }
  }

  /**
   * Get all semesters for a specific academic year and program type
   */
  static async getSemestersForYear(
    academicYear: string, 
    programType: "Regular" | "Weekend"
  ): Promise<AcademicSemester[]> {
    try {
      const semestersRef = collection(db, "academic-semesters");
      const semestersQuery = query(
        semestersRef,
        where("academicYear", "==", academicYear),
        where("programType", "==", programType)
      );
      
      const snapshot = await getDocs(semestersQuery);
      const semesters: AcademicSemester[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        semesters.push({
          id: doc.id,
          name: data.name,
          academicYear: data.academicYear,
          programType: data.programType || "Regular",
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          registrationStart: data.registrationStart?.toDate(),
          registrationEnd: data.registrationEnd?.toDate(),
          status: data.status || "upcoming",
          number: data.number || "1"
        });
      });
      
      // Sort by semester number
      return semesters.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    } catch (error) {
      console.error("Error getting semesters for year:", error);
      return [];
    }
  }

  /**
   * Check if academic year transition is occurring
   */
  static async detectAcademicYearTransition(
    previousAcademicYear: string | null,
    currentAcademicYear: string
  ): Promise<{
    isTransition: boolean;
    transitionType: "new_year" | "same_year" | "rollback";
    previousYear?: string;
    currentYear: string;
    isSafeForProgression: boolean;
  }> {
    if (!previousAcademicYear) {
      return {
        isTransition: false,
        transitionType: "same_year",
        currentYear: currentAcademicYear,
        isSafeForProgression: false
      };
    }

    if (previousAcademicYear !== currentAcademicYear) {
      // Academic year has changed
      const isProgression = this.isAcademicYearProgression(previousAcademicYear, currentAcademicYear);
      
      return {
        isTransition: true,
        transitionType: isProgression ? "new_year" : "rollback",
        previousYear: previousAcademicYear,
        currentYear: currentAcademicYear,
        isSafeForProgression: isProgression
      };
    }

    return {
      isTransition: false,
      transitionType: "same_year",
      currentYear: currentAcademicYear,
      isSafeForProgression: false
    };
  }

  /**
   * Determine if academic year change is a forward progression
   */
  private static isAcademicYearProgression(
    previousYear: string, 
    currentYear: string
  ): boolean {
    try {
      // Extract year numbers from "2024/2025" format
      const prevStartYear = parseInt(previousYear.split('/')[0]);
      const currentStartYear = parseInt(currentYear.split('/')[0]);
      
      // Forward progression if current year is later than previous
      return currentStartYear > prevStartYear;
    } catch (error) {
      console.error("Error determining academic year progression:", error);
      return false;
    }
  }

  /**
   * Check if it's safe to perform progressions
   */
  static async checkProgressionSafety(academicYear: string): Promise<{
    isSafe: boolean;
    reasons: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const safety = {
      isSafe: true,
      reasons: [] as string[],
      warnings: [] as string[],
      recommendations: [] as string[]
    };

    try {
      // Check if there are active semesters
      const activeSemesters = await this.getActiveSemesters(academicYear);
      
      if (activeSemesters.length > 0) {
        safety.isSafe = false;
        safety.reasons.push(`${activeSemesters.length} active semester(s) found for ${academicYear}`);
        safety.recommendations.push("Wait for all semesters to complete before processing progressions");
      }

      // Check for active course registrations (would need integration with course system)
      // This is a placeholder for future integration
      const hasActiveRegistrations = await this.checkActiveRegistrations(academicYear);
      
      if (hasActiveRegistrations) {
        safety.isSafe = false;
        safety.reasons.push("Active course registrations exist for current academic year");
        safety.recommendations.push("Complete all course registrations before progression");
      }

      // Check for pending grade submissions (would need integration with grading system)
      const hasPendingGrades = await this.checkPendingGrades(academicYear);
      
      if (hasPendingGrades) {
        safety.warnings.push("Some grades may still be pending submission");
        safety.recommendations.push("Verify all grades are submitted before progression");
      }

      // Log safety check
      await logProgression("info", "progression_safety_check", 
        `Safety check for ${academicYear}: ${safety.isSafe ? 'SAFE' : 'NOT SAFE'}`, {
        academicYear,
        activeSemesters: activeSemesters.length,
        hasActiveRegistrations,
        hasPendingGrades,
        isSafe: safety.isSafe
      });

      return safety;

    } catch (error) {
      console.error("Error checking progression safety:", error);
      
      safety.isSafe = false;
      safety.reasons.push(`Error during safety check: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return safety;
    }
  }

  /**
   * Get active semesters for academic year
   */
  private static async getActiveSemesters(academicYear: string): Promise<AcademicSemester[]> {
    try {
      const semestersRef = collection(db, "academic-semesters");
      const activeQuery = query(
        semestersRef,
        where("academicYear", "==", academicYear),
        where("status", "==", "active")
      );
      
      const snapshot = await getDocs(activeQuery);
      const activeSemesters: AcademicSemester[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        activeSemesters.push({
          id: doc.id,
          name: data.name,
          academicYear: data.academicYear,
          programType: data.programType || "Regular",
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          status: data.status,
          number: data.number || "1"
        });
      });
      
      return activeSemesters;
    } catch (error) {
      console.error("Error getting active semesters:", error);
      return [];
    }
  }

  /**
   * Check for active course registrations (placeholder)
   */
  private static async checkActiveRegistrations(academicYear: string): Promise<boolean> {
    try {
      // This would integrate with the course registration system
      // For now, return false (no active registrations)
      // In future: query course-registrations collection
      return false;
    } catch (error) {
      console.error("Error checking active registrations:", error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Check for pending grades (placeholder)
   */
  private static async checkPendingGrades(academicYear: string): Promise<boolean> {
    try {
      // This would integrate with the grading system
      // For now, return false (no pending grades)
      // In future: query grades collection for pending submissions
      return false;
    } catch (error) {
      console.error("Error checking pending grades:", error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Get progression schedule based on real academic calendar
   */
  static async getProgressionScheduleFromAcademicCalendar(): Promise<{
    regular: {
      academicYear: string;
      lastSemesterEnd: Date | null;
      nextProgressionDate: Date | null;
      daysUntilProgression: number;
      isProgressionTime: boolean;
    };
    weekend: {
      academicYear: string;
      lastTrimesterEnd: Date | null;
      nextProgressionDate: Date | null;
      daysUntilProgression: number;
      isProgressionTime: boolean;
    };
  }> {
    try {
      const currentPeriod = await this.getCurrentAcademicPeriod();
      if (!currentPeriod) {
        throw new Error("No current academic period found");
      }

      const currentYear = currentPeriod.currentAcademicYear;
      
      // Get semesters for both program types
      const regularSemesters = await this.getSemestersForYear(currentYear, "Regular");
      const weekendSemesters = await this.getSemestersForYear(currentYear, "Weekend");

      // Calculate Regular progression (after 2 semesters)
      const regularLastSemester = regularSemesters
        .filter(s => s.status === "completed" || s.status === "active")
        .sort((a, b) => parseInt(b.number) - parseInt(a.number))[0];

      const regularProgression = this.calculateProgressionDate(regularLastSemester, "Regular");

      // Calculate Weekend progression (after 3 trimesters)
      const weekendLastTrimester = weekendSemesters
        .filter(s => s.status === "completed" || s.status === "active")
        .sort((a, b) => parseInt(b.number) - parseInt(a.number))[0];

      const weekendProgression = this.calculateProgressionDate(weekendLastTrimester, "Weekend");

      return {
        regular: {
          academicYear: currentYear,
          lastSemesterEnd: regularLastSemester?.endDate || null,
          ...regularProgression
        },
        weekend: {
          academicYear: currentYear,
          lastTrimesterEnd: weekendLastTrimester?.endDate || null,
          ...weekendProgression
        }
      };

    } catch (error) {
      console.error("Error getting progression schedule:", error);
      
      // Return safe defaults
      const currentDate = new Date();
      return {
        regular: {
          academicYear: "Unknown",
          lastSemesterEnd: null,
          nextProgressionDate: null,
          daysUntilProgression: 999,
          isProgressionTime: false
        },
        weekend: {
          academicYear: "Unknown", 
          lastTrimesterEnd: null,
          nextProgressionDate: null,
          daysUntilProgression: 999,
          isProgressionTime: false
        }
      };
    }
  }

  /**
   * Calculate progression date based on semester/trimester end (CORRECTED)
   */
  private static calculateProgressionDate(
    lastPeriod: AcademicSemester | undefined,
    programType: "Regular" | "Weekend"
  ): {
    nextProgressionDate: Date | null;
    daysUntilProgression: number;
    isProgressionTime: boolean;
  } {
    if (!lastPeriod) {
      return {
        nextProgressionDate: null,
        daysUntilProgression: 999,
        isProgressionTime: false
      };
    }

    // CORRECTED TIMING: Both Regular and Weekend progress in September
    // - Regular: Complete in May → Progress in September (next year)
    // - Weekend: Complete in August → Progress in September (same year)
    const currentDate = new Date();
    const lastPeriodEndDate = lastPeriod.endDate;
    
    let progressionDate: Date;
    
    if (programType === "Regular") {
      // Regular academic year: Sept → May, progress in September of NEXT year
      const academicEndYear = lastPeriodEndDate.getFullYear();
      const nextYearProgression = academicEndYear + 1; // Next year's September
      progressionDate = new Date(nextYearProgression, 8, 1); // September 1st next year
    } else {
      // Weekend academic year: Oct → August, progress in September of SAME year
      const academicEndYear = lastPeriodEndDate.getFullYear();
      progressionDate = new Date(academicEndYear, 8, 1); // September 1st same year
    }

    const timeDiff = progressionDate.getTime() - currentDate.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      nextProgressionDate: progressionDate,
      daysUntilProgression: Math.max(0, daysUntil),
      isProgressionTime: daysUntil <= 0 && lastPeriod.status === "completed"
    };
  }
}

export default AcademicIntegrationService;
