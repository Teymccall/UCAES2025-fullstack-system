// Script to add a test student record to the student-registrations collection in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration (updated)
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Main function to add a test student record
async function addTestStudent() {
  try {
    // Get the student-registrations collection reference
    const registrationsRef = collection(db, 'student-registrations');
    
    // Create a test student record
    const testStudent = {
      studentIndexNumber: "UCAES20256661", // Using the exact ID from the error message
      registrationNumber: "UCAES20256661",
      surname: "TEST",
      otherNames: "STUDENT",
      gender: "Male",
      dateOfBirth: "17-06-2000", // Format: DD-MM-YYYY - matching the error message
      email: "test.student@ucaes.edu.gh",
      mobile: "0123456789",
      programme: "B.Sc. Agriculture",
      currentLevel: "100",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active"
    };
    
    // Add the test student record to Firestore
    const docRef = await addDoc(registrationsRef, testStudent);
    
    console.log(`✅ Test student record added with ID: ${docRef.id}`);
    console.log(`✅ Student Index Number: ${testStudent.studentIndexNumber}`);
    console.log(`✅ Date of Birth: ${testStudent.dateOfBirth}`);
    console.log('\n📝 You can now try logging in with:');
    console.log(`   Student ID: ${testStudent.studentIndexNumber}`);
    console.log(`   Date of Birth: ${testStudent.dateOfBirth}`);
  } catch (error) {
    console.error('❌ Error adding test student record:', error);
  }
}

// Run the script
addTestStudent().catch(console.error); 