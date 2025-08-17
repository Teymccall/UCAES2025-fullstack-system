import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Get the system academic period configuration
 */
export async function getSystemAcademicPeriod() {
  try {
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting system academic period:", error);
    return null;
  }
}

/**
 * Get the current academic year with fallback to legacy method
 */
export async function getCurrentAcademicYear() {
  try {
    // Try new centralized system first
    const systemConfig = await getSystemAcademicPeriod();
    
    if (systemConfig?.currentAcademicYear) {
      console.log("Using system academic year:", systemConfig.currentAcademicYear);
      return systemConfig.currentAcademicYear;
    }
    
    // Fall back to existing method if new system doesn't have data
    console.log("Falling back to legacy academic year method");
    return getLegacyCurrentYear();
  } catch (error) {
    console.error("Error in getCurrentAcademicYear:", error);
    // Always fall back to existing method on error
    return getLegacyCurrentYear();
  }
}

/**
 * Get the current semester with fallback
 */
export async function getCurrentSemester() {
  try {
    // Try new centralized system first
    const systemConfig = await getSystemAcademicPeriod();
    
    if (systemConfig?.currentSemester) {
      return systemConfig.currentSemester;
    }
    
    // Fall back to default if not available
    return "First Semester"; // Default fallback
  } catch (error) {
    console.error("Error in getCurrentSemester:", error);
    return "First Semester"; // Default fallback
  }
}

/**
 * Legacy method to get current academic year
 */
function getLegacyCurrentYear(): string {
  // Get the current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)

  // If we're in the first half of the year (Jan-Jun), academic year is previous/current
  // Otherwise (Jul-Dec), it's current/next
  if (currentMonth < 6) {
    return `${currentYear - 1}/${currentYear}`;
  } else {
    return `${currentYear}/${currentYear + 1}`;
  }
} 