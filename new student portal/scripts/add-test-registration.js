/**
 * Script to add a test student registration
 * This adds a sample student to the database for testing login
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
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

// Generate a test registration number
function generateTestRegistrationNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `UCAES${year}${randomNum}`;
}

async function addTestStudent() {
  try {
    const registrationNumber = generateTestRegistrationNumber();
    const studentIndexNumber = `UCAES-TEST-${Math.floor(Math.random() * 100000)}`;
    
    // Create student data
    const studentData = {
      surname: "TEST",
      otherNames: "STUDENT",
      gender: "male",
      dateOfBirth: "01-01-2000",
      placeOfBirth: "TEST CITY",
      nationality: "GHANA",
      religion: "CHRISTIAN",
      maritalStatus: "single",
      nationalId: "GHA-TEST-1234567",
      physicalChallenge: "none",
      email: "test.student@example.com",
      mobile: "0123456789",
      street: "TEST STREET",
      city: "ACCRA",
      country: "GHANA",
      guardianName: "TEST PARENT",
      relationship: "parent",
      guardianContact: "0987654321",
      guardianEmail: "parent@example.com",
      guardianAddress: "GUARDIAN ADDRESS",
      programme: "B.Sc. Computer Science",
      yearOfEntry: "2023",
      entryQualification: "WASSCE",
      entryLevel: "100",
      hallOfResidence: "RESIDENTIAL",
      scheduleType: "Regular",
      currentLevel: "100",
      entryAcademicYear: "2023/2024",
      currentPeriod: "First Semester",
      registrationDate: serverTimestamp(),
      status: "pending",
      registrationNumber: registrationNumber,
      studentIndexNumber: studentIndexNumber,
    };
    
    console.log('Adding test student to database...');
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, "student-registrations"), studentData);
    
    console.log(`Test student added with ID: ${docRef.id}`);
    console.log(`Registration Number: ${registrationNumber}`);
    console.log(`Student Index Number: ${studentIndexNumber}`);
    console.log(`Date of Birth: ${studentData.dateOfBirth}`);
    console.log('\nYou can now test the login with:');
    console.log(`Registration Number: ${registrationNumber}`);
    console.log(`Date of Birth: ${studentData.dateOfBirth}`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding test student:', error);
    return null;
  }
}

// Run the function
addTestStudent().then(() => {
  console.log('\nScript completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 