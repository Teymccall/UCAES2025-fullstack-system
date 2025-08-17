// Script to check student records in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, getDocs, where, limit } = require('firebase/firestore');

// Firebase configuration (updated for ucaes2025 project)
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Get student ID from command line arguments
const studentId = process.argv[2] || '';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Main function
async function checkStudentRecords() {
  try {
    console.log('🔍 Checking student records in Firestore');
    console.log('📊 Connected to project: ucaes2025');
    
    // Get the student-registrations collection
    const registrationsRef = collection(db, 'student-registrations');
    
    // If a specific student ID is provided, search for that student
    if (studentId) {
      const studentIdUpper = studentId.toUpperCase();
      console.log(`🔍 Searching for student with ID: ${studentIdUpper}`);
      
      // Try different search methods
      console.log('\n📊 Checking by registration number:');
      const regQuery = query(registrationsRef, where('registrationNumber', '==', studentIdUpper), limit(1));
      const regSnapshot = await getDocs(regQuery);
      
      if (!regSnapshot.empty) {
        console.log('✅ Found student by registration number:');
        logStudents(regSnapshot);
      } else {
        console.log('❌ Not found by registration number');
        
        // Try by index number
        console.log('\n📊 Checking by student index number:');
        const indexQuery = query(registrationsRef, where('studentIndexNumber', '==', studentIdUpper), limit(1));
        const indexSnapshot = await getDocs(indexQuery);
        
        if (!indexSnapshot.empty) {
          console.log('✅ Found student by index number:');
          logStudents(indexSnapshot);
        } else {
          console.log('❌ Not found by index number');
        }
      }
    } else {
      // List some sample students from the collection
      console.log('\n📊 Listing sample students from collection:');
      const sampleQuery = query(registrationsRef, limit(5));
      const sampleSnapshot = await getDocs(sampleQuery);
      
      if (!sampleSnapshot.empty) {
        console.log(`📋 Found ${sampleSnapshot.size} sample student(s):`);
        logStudents(sampleSnapshot);
      } else {
        console.log('❌ No students found in the collection');
      }
    }
  } catch (error) {
    console.error('Error checking student records:', error);
  }
}

// Helper function to log student information
function logStudents(snapshot) {
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`\nStudent ID: ${doc.id}`);
    console.log(`- Registration Number: ${data.registrationNumber || 'N/A'}`);
    console.log(`- Student Index Number: ${data.studentIndexNumber || 'N/A'}`);
    console.log(`- Index Number: ${data.indexNumber || 'N/A'}`);
    console.log(`- Name: ${data.surname || ''} ${data.otherNames || ''}`);
    console.log(`- Date of Birth: ${data.dateOfBirth || 'N/A'}`);
    console.log(`- Gender: ${data.gender || 'N/A'}`);
    console.log(`- Programme: ${data.programme || 'N/A'}`);
    console.log(`- Current Level: ${data.currentLevel || 'N/A'}`);
    console.log(`- Status: ${data.status || 'N/A'}`);
    console.log('\nLogin Instructions:');
    console.log(`1. Student ID/Index: ${data.studentIndexNumber || data.registrationNumber || data.indexNumber}`);
    console.log(`2. Date of Birth: ${data.dateOfBirth} (Format: DD-MM-YYYY)`);
  });
}

// Run the script
checkStudentRecords().catch(console.error); 