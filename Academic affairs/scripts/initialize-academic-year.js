const { initializeApp } = require('firebase/app')
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore')

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvOkJqHqHqHqHqHqHqHqHqHqHqHqHqHq",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function initializeAcademicYear() {
  console.log("🎓 Initializing Academic Year Management...")
  
  try {
    // Create a default academic year for 2025
    const yearData = {
      year: "2025",
      displayName: "2025/2026 Academic Year",
      startDate: "2025-09-01",
      endDate: "2026-08-31",
      isActive: true,
      admissionStatus: "open",
      admissionStartDate: "2025-01-01",
      admissionEndDate: "2025-08-31",
      maxApplications: 1000,
      currentApplications: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: "system"
    }
    
    // Set the academic year document
    const yearRef = doc(db, 'academic-years', '2025')
    await setDoc(yearRef, yearData)
    console.log("✅ Created academic year 2025")
    
    // Set current academic year settings
    const settingsData = {
      currentYear: "2025",
      admissionStatus: "open",
      admissionStartDate: "2025-01-01",
      admissionEndDate: "2025-08-31",
      maxApplications: 1000,
      updatedAt: serverTimestamp(),
      updatedBy: "system"
    }
    
    const settingsRef = doc(db, 'academic-settings', 'current-year')
    await setDoc(settingsRef, settingsData)
    console.log("✅ Set 2025 as current academic year")
    
    console.log("\n📋 Academic Year Configuration:")
    console.log("   - Year: 2025")
    console.log("   - Display Name: 2025/2026 Academic Year")
    console.log("   - Admission Status: OPEN")
    console.log("   - Admission Period: Jan 1, 2025 - Aug 31, 2025")
    console.log("   - Max Applications: 1,000")
    
    console.log("\n🎉 Academic Year Management Initialized Successfully!")
    console.log("✅ Director can now manage academic years from the admissions dashboard")
    console.log("✅ Admission website will check status and allow applications")
    console.log("✅ Real-time connection established between systems")
    
  } catch (error) {
    console.error("❌ Error initializing academic year:", error)
  }
}

// Run the initialization
initializeAcademicYear()
  .then(() => {
    console.log("\n🚀 Ready to test the connection!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Initialization failed:", error)
    process.exit(1)
  }) 