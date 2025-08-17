/**
 * This script tests the system config for academic year centralization
 */
import { getSystemAcademicPeriod, updateSystemAcademicPeriod } from "../lib/system-config.js";

async function main() {
  console.log("Testing system config...");
  
  try {
    // First get the current config
    console.log("Getting current system config...");
    const config = await getSystemAcademicPeriod();
    console.log("Current config:", config);
    
    if (config) {
      console.log("System config found:");
      console.log("Current Academic Year:", config.currentAcademicYear);
      console.log("Current Academic Year ID:", config.currentAcademicYearId);
      console.log("Current Semester:", config.currentSemester);
      console.log("Current Semester ID:", config.currentSemesterId);
      console.log("Last Updated:", config.lastUpdated?.toDate());
      console.log("Updated By:", config.updatedBy);
    } else {
      console.log("No system config found. Please run init-system-config.js first.");
    }
  } catch (error) {
    console.error("ERROR: Failed to test system config:", error);
  }
  
  console.log("Testing process completed.");
}

main().catch(console.error); 