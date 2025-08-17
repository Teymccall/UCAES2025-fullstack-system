// Test script to verify Firebase registration functionality
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore")

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Test function to submit a minimal registration
async function testRegistration() {
  try {
    console.log("Testing Firebase connection and registration submission...")
    
    // Create minimal test data
    const testData = {
      surname: "TEST",
      otherNames: "STUDENT",
      email: `test-${Date.now()}@example.com`,
      gender: "male",
      dateOfBirth: "01-01-2000",
      placeOfBirth: "TEST CITY",
      nationality: "GHANAIAN",
      religion: "CHRISTIAN",
      maritalStatus: "single",
      nationalId: "",
      ssnitNumber: "",
      physicalChallenge: "none",
      studentIndexNumber: "",
      mobile: "0241234567",
      street: "TEST STREET",
      city: "ACCRA",
      country: "GHANA",
      guardianName: "TEST GUARDIAN",
      relationship: "parent",
      guardianContact: "0241234568",
      guardianEmail: "guardian@example.com",
      guardianAddress: "TEST ADDRESS",
      programme: "Computer Science",
      yearOfEntry: "2025",
      entryQualification: "WASSCE",
      entryLevel: "100",
      hallOfResidence: "NONE",
      scheduleType: "Regular",
      currentLevel: "100",
      entryAcademicYear: "2024/2025",
      currentPeriod: "First Semester",
      registrationDate: serverTimestamp(),
      status: "pending",
      registrationNumber: `UCAES2025${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
    }
    
    console.log("Attempting to add document to student-registrations collection...")
    const docRef = await addDoc(collection(db, "student-registrations"), testData)
    console.log("✅ SUCCESS! Document written with ID:", docRef.id)
    
    return docRef.id
  } catch (error) {
    console.error("❌ ERROR during registration test:", error)
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)
    throw error
  }
}

// Run the test
testRegistration()
  .then((id) => {
    console.log("Registration test completed successfully with ID:", id)
    process.exit(0)
  })
  .catch((error) => {
    console.error("Registration test failed:", error)
    process.exit(1)
  }) 