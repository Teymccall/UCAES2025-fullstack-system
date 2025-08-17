'use client';

import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Update the system academic period configuration
 */
export async function updateSystemAcademicPeriod(yearId, yearString, semesterId, semesterString, userId) {
  try {
    const configRef = doc(db, "systemConfig", "academicPeriod");
    
    await setDoc(configRef, {
      currentAcademicYearId: yearId,
      currentAcademicYear: yearString,
      currentSemesterId: semesterId,
      currentSemester: semesterString,
      lastUpdated: serverTimestamp(),
      updatedBy: userId
    }, { merge: true });
    
    console.log("System academic period updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating system academic period:", error);
    return false;
  }
}

/**
 * Get the current system academic period
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
 * Initialize the system config with current values if it doesn't exist
 */
export async function initializeSystemConfig() {
  try {
    // Check if config already exists
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) {
      console.log("Initializing system config...");
      
      // Get current active academic year from existing system
      const yearsRef = collection(db, "academic-years");
      const q = query(yearsRef, where("status", "==", "active"), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const activeYear = snapshot.docs[0];
        
        // Find active semester if any
        const semestersRef = collection(db, "academic-semesters");
        const semQ = query(
          semestersRef, 
          where("academicYear", "==", activeYear.id),
          where("status", "==", "active"),
          limit(1)
        );
        const semSnapshot = await getDocs(semQ);
        let semesterId = null;
        let semesterName = null;
        
        if (!semSnapshot.empty) {
          const activeSem = semSnapshot.docs[0];
          semesterId = activeSem.id;
          semesterName = activeSem.data().name;
        }
        
        // Create initial config that matches current state
        await setDoc(configRef, {
          currentAcademicYearId: activeYear.id,
          currentAcademicYear: activeYear.data().year,
          currentSemesterId: semesterId,
          currentSemester: semesterName,
          lastUpdated: serverTimestamp(),
          updatedBy: "system_initialization"
        });
        
        console.log("System config initialized with existing academic year");
        return true;
      }
    } else {
      console.log("System config already exists");
      return false;
    }
  } catch (error) {
    console.error("Error initializing system config:", error);
    return false;
  }
} 