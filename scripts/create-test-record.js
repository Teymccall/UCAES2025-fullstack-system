// create-test-record.js
// This script creates a test academic record in Firebase

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create a sample academic record
async function createTestRecord() {
  try {
    // Create a sample record for Hanamel (using ID from terminal output)
    const studentId = "LsxM8sxnE0dIHvLZ9Lvo";
    const docId = `test_record_1`;
    
    const academicRecord = {
      studentId,
      programme: "B.Sc. Environmental Science and Management",
      programmeDuration: 4,
      currentLevel: "Level 300",
      currentLevelNumber: 300,
      yearOfAdmission: "2021",
      expectedCompletionYear: "2025",
      entryQualification: "WASSCE",
      entryLevel: "Level 100",
      currentCGPA: 3.45,
      totalCreditsEarned: 108,
      totalCreditsRequired: 144,
      creditsRemaining: 36,
      academicStanding: "Good Standing",
      projectedClassification: "Second Class Upper",
      probationStatus: "None",
      graduationEligibility: "On Track",
      updatedAt: new Date().toISOString(),
      levels: [
        {
          level: "Level 100",
          levelNumber: 100,
          creditsRequired: 36,
          creditsEarned: 36,
          gpa: 3.2,
          status: "completed",
          academicYear: "2021/2022"
        },
        {
          level: "Level 200",
          levelNumber: 200,
          creditsRequired: 36,
          creditsEarned: 36,
          gpa: 3.6,
          status: "completed",
          academicYear: "2022/2023"
        },
        {
          level: "Level 300",
          levelNumber: 300,
          creditsRequired: 36,
          creditsEarned: 36,
          gpa: 3.5,
          status: "in-progress",
          academicYear: "2023/2024"
        },
        {
          level: "Level 400",
          levelNumber: 400,
          creditsRequired: 36,
          creditsEarned: 0,
          gpa: 0,
          status: "upcoming",
          academicYear: "2024/2025"
        }
      ]
    };
    
    // Add the record to Firebase
    await setDoc(doc(db, "academic-records", docId), academicRecord);
    console.log(`Test academic record created with ID: ${docId}`);
    
  } catch (error) {
    console.error('Error creating test record:', error);
  }
}

// Run the function
createTestRecord()
  .then(() => console.log('Test record creation completed'))
  .catch(err => console.error('Error:', err)); 