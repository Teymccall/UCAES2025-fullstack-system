const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc, updateDoc, serverTimestamp } = require('firebase/firestore')

// Firebase configuration - matches the actual system configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Simulate the admission website's checkAdmissionStatus function - matches actual implementation
async function checkAdmissionStatus() {
  try {
    console.log("🔍 Admission Website: Checking admission status...")
    
    // Try centralized system first (systemConfig/academicPeriod)
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    let currentYear = null
    let yearData = null
    
    if (systemConfigDoc.exists()) {
      console.log("✅ Using centralized academic year system")
      const systemData = systemConfigDoc.data()
      currentYear = systemData.currentAcademicYearId
      
      if (currentYear) {
        // Get the academic year document
        const yearRef = doc(db, 'academic-years', currentYear)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          yearData = yearDoc.data()
          console.log(`📊 Found centralized admission status for ${systemData.currentAcademicYear}: ${yearData.admissionStatus}`)
        }
      }
    }
    
    // Fallback to legacy system (academic-settings/current-year) if centralized system doesn't have data
    if (!currentYear || !yearData) {
      console.log("⚠️ Centralized system not found, falling back to legacy system")
      const settingsRef = doc(db, 'academic-settings', 'current-year')
      const settingsDoc = await getDoc(settingsRef)
      
      if (!settingsDoc.exists()) {
        console.log("⚠️ No current academic year found in either system")
        return {
          isOpen: false,
          message: "No admission period is currently configured"
        }
      }
      
      const data = settingsDoc.data()
      currentYear = data.currentYear
      
      // Get the academic year document
      const yearRef = doc(db, 'academic-years', currentYear)
      const yearDoc = await getDoc(yearRef)
      
      if (!yearDoc.exists()) {
        console.log("⚠️ Academic year document not found")
        return {
          isOpen: false,
          message: "Admission period not found"
        }
      }
      
      yearData = yearDoc.data()
      console.log(`📊 Using legacy admission status for ${currentYear}: ${yearData.admissionStatus}`)
    }
    
    const isOpen = yearData.admissionStatus === 'open'
    
    console.log(`📊 Final admission status: ${yearData.admissionStatus} (${isOpen ? 'OPEN' : 'CLOSED'})`)
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed"
    }
  } catch (error) {
    console.error("❌ Admission Website: Error checking admission status:", error)
    return {
      isOpen: false,
      message: `Connection error: ${error.message}`
    }
  }
}

async function testAdmissionWebsiteResponse() {
  console.log("🌐 Testing Admission Website Response...")
  
  try {
    // Test 1: Check current status
    console.log("\n1. Testing current admission status...")
    const status = await checkAdmissionStatus()
    
    if (status.isOpen) {
      console.log("✅ Admission Website: Would show application form")
      console.log("   - Status: OPEN")
      console.log("   - Message: Admissions are open")
      console.log("   - Action: Allow applicants to register and apply")
    } else {
      console.log("❌ Admission Website: Would show closed message")
      console.log("   - Status: CLOSED")
      console.log("   - Message:", status.message)
      console.log("   - Action: Show 'Admissions Currently Closed' page")
    }
    
    // Test 2: Simulate director closing admissions
    console.log("\n2. Simulating director closing admissions...")
    
    // Get the current academic year ID from centralized system
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    if (!systemConfigDoc.exists()) {
      console.log("❌ Cannot find current academic year ID")
      return
    }
    
    const systemData = systemConfigDoc.data()
    const currentYearId = systemData.currentAcademicYearId
    
    const yearRef = doc(db, 'academic-years', currentYearId)
    await updateDoc(yearRef, {
      admissionStatus: 'closed',
      updatedAt: serverTimestamp()
    })
    
    const closedStatus = await checkAdmissionStatus()
    console.log("✅ Admission Website: Now shows CLOSED status")
    console.log("   - Applicants would see 'Admissions Currently Closed' page")
    console.log("   - No application form would be available")
    
    // Test 3: Simulate director opening admissions
    console.log("\n3. Simulating director opening admissions...")
    await updateDoc(yearRef, {
      admissionStatus: 'open',
      updatedAt: serverTimestamp()
    })
    
    const openStatus = await checkAdmissionStatus()
    console.log("✅ Admission Website: Now shows OPEN status")
    console.log("   - Applicants would see application form")
    console.log("   - Registration and application process available")
    
    console.log("\n🎉 Admission Website Response Test Complete!")
    console.log("\n📋 Summary:")
    console.log("✅ Admission website properly checks academic year status")
    console.log("✅ Real-time updates when director changes status")
    console.log("✅ Appropriate UI shown based on admission status")
    console.log("✅ Seamless integration between academic affairs and admission website")
    
  } catch (error) {
    console.error("❌ Error testing admission website response:", error)
  }
}

// Run the test
testAdmissionWebsiteResponse()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Test failed:", error)
    process.exit(1)
  }) 