// Script to add a test student record to the student-registrations collection in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration from firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
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
      studentIndexNumber: "UCAES20259770", // This is the ID that was failing in the error message
      registrationNumber: "UCAES20259770",
      surname: "TEST",
      otherNames: "STUDENT",
      gender: "Male",
      dateOfBirth: "01-01-2000", // Format: DD-MM-YYYY
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