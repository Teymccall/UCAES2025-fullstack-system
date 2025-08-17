// seed-academic-records.js
//
// This script creates sample academic records in Firebase for testing
// Run with: node scripts/seed-academic-records.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  limit 
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to create academic record for a student
async function createAcademicRecord(studentId, recordData) {
  try {
    // Generate a document ID using student ID
    const docId = `acad_${studentId}`;
    
    // Add the record to Firebase
    await setDoc(doc(db, "academic-records", docId), {
      ...recordData,
      studentId,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`Academic record created for student ${studentId}`);
    return true;
  } catch (error) {
    console.error(`Failed to create record for student ${studentId}:`, error);
    return false;
  }
}

// Generate academic levels data based on student info
function generateLevelsData(currentLevel, startYear, programmeDuration) {
  const levels = [];
  const creditsPerLevel = 36;
  
  // Parse start year
  let year = parseInt(startYear);
  if (isNaN(year)) {
    year = new Date().getFullYear() - 4; // Default to 4 years ago
  }
  
  for (let level = 100; level <= programmeDuration * 100; level += 100) {
    const levelYear = year + ((level / 100) - 1);
    const nextYear = levelYear + 1;
    const academicYear = `${levelYear}/${nextYear}`;
    
    let status = 'upcoming';
    let creditsEarned = 0;
    let gpa = 0;
    
    if (level < currentLevel) {
      status = 'completed';
      creditsEarned = creditsPerLevel;
      // Generate random GPA between 3.0-4.0
      gpa = parseFloat((3.0 + Math.random() * 1.0).toFixed(2));
    } else if (level === currentLevel) {
      status = 'in-progress';
      creditsEarned = creditsPerLevel;
      gpa = parseFloat((3.0 + Math.random() * 0.5).toFixed(2)); // Current level GPA is slightly lower
    }
    
    levels.push({
      level: `Level ${level}`,
      levelNumber: level,
      creditsRequired: creditsPerLevel,
      creditsEarned,
      gpa,
      status,
      academicYear
    });
  }
  
  return levels;
}

// Main function to seed academic records for existing students
async function seedAcademicRecords() {
  try {
    console.log('Starting to seed academic records...');
    
    // Get a list of all registered students
    const studentsRef = collection(db, 'student-registrations');
    const studentSnapshot = await getDocs(studentsRef);
    
    if (studentSnapshot.empty) {
      console.log('No students found in the database');
      return;
    }
    
    console.log(`Found ${studentSnapshot.size} students. Creating academic records...`);
    let success = 0;
    
    for (const studentDoc of studentSnapshot.docs) {
      const studentData = studentDoc.data();
      const studentId = studentDoc.id;
      
      // Skip if missing critical information
      if (!studentData.programme) {
        console.log(`Skipping student ${studentId} - missing programme information`);
        continue;
      }
      
      // Parse current level from student data
      let currentLevelNumber = 100;
      if (studentData.currentLevel) {
        const match = studentData.currentLevel.match(/\d+/);
        if (match) {
          currentLevelNumber = parseInt(match[0]);
        }
      }
      
      // Generate programme duration based on programme name
      let programmeDuration = 4; // Default to 4 years
      if (studentData.programme.toLowerCase().includes('certificate')) {
        programmeDuration = 2;
      } else if (studentData.programme.toLowerCase().includes('diploma')) {
        programmeDuration = 3;
      }
      
      // Calculate how many levels the student has completed
      const levels = generateLevelsData(
        currentLevelNumber, 
        studentData.yearOfEntry || '2021',
        programmeDuration
      );
      
      // Calculate total credits earned
      const totalCreditsEarned = levels.reduce((total, level) => total + level.creditsEarned, 0);
      const totalCreditsRequired = programmeDuration * 36; // 36 credits per year
      
      // Calculate CGPA from completed levels
      const completedLevels = levels.filter(level => level.status === 'completed');
      let currentCGPA = 0;
      
      if (completedLevels.length > 0) {
        const totalGPA = completedLevels.reduce((sum, level) => sum + level.gpa, 0);
        currentCGPA = parseFloat((totalGPA / completedLevels.length).toFixed(2));
      } else if (levels.some(level => level.status === 'in-progress')) {
        // If no completed levels but in progress, set a starting CGPA
        currentCGPA = parseFloat((3.0 + Math.random() * 0.5).toFixed(2));
      }
      
      // Create the academic record
      const academicRecordData = {
        programme: studentData.programme,
        programmeDuration,
        currentLevel: studentData.currentLevel || `Level ${currentLevelNumber}`,
        currentLevelNumber,
        yearOfAdmission: studentData.yearOfEntry || '2021',
        expectedCompletionYear: (parseInt(studentData.yearOfEntry || '2021') + programmeDuration).toString(),
        entryQualification: studentData.entryQualification || 'WASSCE',
        entryLevel: studentData.entryLevel || 'Level 100',
        currentCGPA,
        totalCreditsEarned,
        totalCreditsRequired,
        creditsRemaining: totalCreditsRequired - totalCreditsEarned,
        academicStanding: 'Good Standing', // Default value
        projectedClassification: getProjectedClassification(currentCGPA),
        probationStatus: 'None',
        graduationEligibility: 'On Track',
        levels
      };
      
      const result = await createAcademicRecord(studentId, academicRecordData);
      if (result) success++;
    }
    
    console.log(`Successfully created ${success} academic records out of ${studentSnapshot.size} students`);
  } catch (error) {
    console.error('Error seeding academic records:', error);
  }
}

// Helper function for projected classification
function getProjectedClassification(cgpa) {
  if (cgpa >= 3.6) return 'First Class';
  if (cgpa >= 3.0) return 'Second Class Upper';
  if (cgpa >= 2.5) return 'Second Class Lower';
  if (cgpa >= 2.0) return 'Third Class';
  if (cgpa >= 1.0) return 'Pass';
  return 'Not Available';
}

// Run the seed function
seedAcademicRecords()
  .then(() => console.log('Seeding completed'))
  .catch(err => console.error('Error running seed script:', err)); 