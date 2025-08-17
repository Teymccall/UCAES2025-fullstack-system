/**
 * This script fixes the dates in academic-years and academic-semesters collections
 * Run with: node fix-dates.js
 */

// Import required Firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, collection, getDocs, doc, updateDoc
} = require('firebase/firestore');

// Firebase configuration - Make sure to replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA3tSu-IjgTVMTngdB8fPKwD9NMlQ8tRQU",
  authDomain: "ucaes-001.firebaseapp.com",
  projectId: "ucaes-001",
  storageBucket: "ucaes-001.appspot.com",
  messagingSenderId: "111111111",
  appId: "1:111111111:web:111111111"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const ACADEMIC_YEARS = 'academic-years';
const ACADEMIC_SEMESTERS = 'academic-semesters';

/**
 * Ensures a value is a proper Date object
 */
function ensureDate(value) {
  if (!value) return new Date();
  
  // If it's already a Date object
  if (value instanceof Date) return value;
  
  // If it's a Firestore timestamp
  if (typeof value === 'object' && value.toDate) {
    return value.toDate();
  }
  
  // Try to parse string
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }
  
  // Default to current date if parsing fails
  return new Date();
}

async function fixAcademicYearDates() {
  console.log("\n=== Fixing Academic Years Dates ===");
  
  try {
    // Get all academic years
    const yearsSnapshot = await getDocs(collection(db, ACADEMIC_YEARS));
    console.log(`Found ${yearsSnapshot.size} academic years.`);
    
    if (yearsSnapshot.empty) {
      console.log("No academic years found.");
      return;
    }
    
    // Process each academic year
    for (const yearDoc of yearsSnapshot.docs) {
      const yearData = yearDoc.data();
      console.log(`\nProcessing year: ${yearData.year}`);
      
      // Check if dates need fixing
      let needsUpdate = false;
      let updateData = {};
      
      // Fix start date
      if (yearData.startDate) {
        const startDate = ensureDate(yearData.startDate);
        if (startDate.toString() !== yearData.startDate.toString()) {
          updateData.startDate = startDate;
          console.log(`  Fixing startDate: ${yearData.startDate} -> ${startDate}`);
          needsUpdate = true;
        }
      }
      
      // Fix end date
      if (yearData.endDate) {
        const endDate = ensureDate(yearData.endDate);
        if (endDate.toString() !== yearData.endDate.toString()) {
          updateData.endDate = endDate;
          console.log(`  Fixing endDate: ${yearData.endDate} -> ${endDate}`);
          needsUpdate = true;
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await updateDoc(doc(db, ACADEMIC_YEARS, yearDoc.id), updateData);
        console.log(`  ✅ Updated academic year: ${yearData.year}`);
      } else {
        console.log(`  ✓ No date fixes needed for ${yearData.year}`);
      }
    }
  } catch (error) {
    console.error("Error fixing academic years:", error);
  }
}

async function fixAcademicSemesterDates() {
  console.log("\n=== Fixing Academic Semesters Dates ===");
  
  try {
    // Get all academic semesters
    const semestersSnapshot = await getDocs(collection(db, ACADEMIC_SEMESTERS));
    console.log(`Found ${semestersSnapshot.size} academic semesters.`);
    
    if (semestersSnapshot.empty) {
      console.log("No academic semesters found.");
      return;
    }
    
    // Process each academic semester
    for (const semesterDoc of semestersSnapshot.docs) {
      const semesterData = semesterDoc.data();
      console.log(`\nProcessing semester: ${semesterData.name}`);
      
      // Check if dates need fixing
      let needsUpdate = false;
      let updateData = {};
      
      // Fix start date
      if (semesterData.startDate) {
        const startDate = ensureDate(semesterData.startDate);
        if (startDate.toString() !== semesterData.startDate.toString()) {
          updateData.startDate = startDate;
          console.log(`  Fixing startDate: ${semesterData.startDate} -> ${startDate}`);
          needsUpdate = true;
        }
      }
      
      // Fix end date
      if (semesterData.endDate) {
        const endDate = ensureDate(semesterData.endDate);
        if (endDate.toString() !== semesterData.endDate.toString()) {
          updateData.endDate = endDate;
          console.log(`  Fixing endDate: ${semesterData.endDate} -> ${endDate}`);
          needsUpdate = true;
        }
      }
      
      // Fix registration start date
      if (semesterData.registrationStart) {
        const registrationStart = ensureDate(semesterData.registrationStart);
        if (registrationStart.toString() !== semesterData.registrationStart.toString()) {
          updateData.registrationStart = registrationStart;
          console.log(`  Fixing registrationStart: ${semesterData.registrationStart} -> ${registrationStart}`);
          needsUpdate = true;
        }
      }
      
      // Fix registration end date
      if (semesterData.registrationEnd) {
        const registrationEnd = ensureDate(semesterData.registrationEnd);
        if (registrationEnd.toString() !== semesterData.registrationEnd.toString()) {
          updateData.registrationEnd = registrationEnd;
          console.log(`  Fixing registrationEnd: ${semesterData.registrationEnd} -> ${registrationEnd}`);
          needsUpdate = true;
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await updateDoc(doc(db, ACADEMIC_SEMESTERS, semesterDoc.id), updateData);
        console.log(`  ✅ Updated academic semester: ${semesterData.name}`);
      } else {
        console.log(`  ✓ No date fixes needed for ${semesterData.name}`);
      }
    }
  } catch (error) {
    console.error("Error fixing academic semesters:", error);
  }
}

// Main function
async function main() {
  console.log("Starting date fix script...");
  
  await fixAcademicYearDates();
  await fixAcademicSemesterDates();
  
  console.log("\n✅ Done! All dates have been fixed.");
  process.exit(0);
}

// Run the script
main(); 