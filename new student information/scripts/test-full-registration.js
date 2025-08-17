const { initializeApp } = require("firebase/app")
const { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } = require("firebase/firestore")

// Firebase configuration - exactly as in the app
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

// Generate registration number (same logic as in the app)
function generateRegistrationNumber() {
  const year = new Date().getFullYear()
  // Use a test number for testing purposes
  const testNumber = Math.floor(Math.random() * 1000) + 1000 // 1000-1999 for testing
  const paddedNumber = testNumber.toString().padStart(4, "0")
  return `UCAES${year}${paddedNumber}`
}

// Test the complete registration flow
async function testCompleteRegistration() {
  try {
    console.log("🧪 Testing complete registration flow...")
    
    const registrationNumber = generateRegistrationNumber()
    console.log("📋 Generated registration number:", registrationNumber)
    
    // Create realistic form data (matching the actual form structure)
    const formData = {
      surname: "TESTING",
      otherNames: "STUDENT FLOW",
      gender: "female",
      dateOfBirth: "15-03-2005",
      placeOfBirth: "KUMASI",
      nationality: "GHANAIAN",
      religion: "CHRISTIAN",
      maritalStatus: "single",
      nationalId: "GHA-123456789-0",
      ssnitNumber: "",
      physicalChallenge: "none",
      studentIndexNumber: "2024567890",
      email: `teststudent.${Date.now()}@gmail.com`,
      mobile: "0201234567",
      street: "123 TEST STREET",
      city: "ACCRA",
      country: "GHANA",
      guardianName: "PARENT TESTING",
      relationship: "mother",
      guardianContact: "0241234567",
      guardianEmail: "parent.test@gmail.com",
      guardianAddress: "123 PARENT STREET, ACCRA",
      programme: "Bachelor of Science in Computer Science",
      yearOfEntry: "2025",
      entryQualification: "WASSCE",
      entryLevel: "100",
      hallOfResidence: "HOSTEL A",
      scheduleType: "Regular",
      currentLevel: "100",
      entryAcademicYear: "2024/2025",
      currentPeriod: "First Semester",
      registrationDate: serverTimestamp(),
      status: "pending",
      registrationNumber: registrationNumber,
    }
    
    console.log("📝 Submitting registration data...")
    
    // Step 1: Add to student-registrations collection
    const docRef = await addDoc(collection(db, "student-registrations"), formData)
    console.log("✅ Registration document created with ID:", docRef.id)
    
    // Step 2: Verify the document exists and can be retrieved
    console.log("🔍 Verifying registration was saved...")
    const docSnap = await getDoc(doc(db, "student-registrations", docRef.id))
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log("✅ Registration verified! Student:", data.surname, data.otherNames)
      console.log("📧 Email:", data.email)
      console.log("📞 Mobile:", data.mobile)
      console.log("🏫 Programme:", data.programme)
      console.log("📊 Status:", data.status)
      
      return {
        success: true,
        id: docRef.id,
        registrationNumber: data.registrationNumber,
        email: data.email
      }
    } else {
      throw new Error("Registration document not found after creation!")
    }
    
  } catch (error) {
    console.error("❌ Complete registration test FAILED:", error)
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run the comprehensive test
testCompleteRegistration()
  .then((result) => {
    if (result.success) {
      console.log("\n🎉 SUCCESS! Complete registration flow working perfectly!")
      console.log("📋 Registration ID:", result.id)
      console.log("🔢 Registration Number:", result.registrationNumber)
      console.log("📧 Student Email:", result.email)
      console.log("\n✅ The registration system is fully functional!")
    } else {
      console.log("\n❌ FAILED! Registration flow has issues:")
      console.log("Error:", result.error)
    }
    process.exit(result.success ? 0 : 1)
  })
  .catch((error) => {
    console.error("\n💥 Test crashed:", error)
    process.exit(1)
  }) 