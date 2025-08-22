'use client';

// Define the functions directly to avoid circular reference
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Update the system academic period configuration
 */
export async function updateSystemAcademicPeriod(yearId, yearString, semesterId, semesterString, userId, admissionStatus = null) {
  try {
    const configRef = doc(db, "systemConfig", "academicPeriod");
    
    const updateData = {
      currentAcademicYearId: yearId,
      currentAcademicYear: yearString,
      currentSemesterId: semesterId,
      currentSemester: semesterString,
      lastUpdated: serverTimestamp(),
      updatedBy: userId
    };

    // Include admission status if provided
    if (admissionStatus !== null) {
      updateData.admissionStatus = admissionStatus;
    }
    
    await setDoc(configRef, updateData, { merge: true });
    
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