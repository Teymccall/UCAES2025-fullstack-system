const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } = require('firebase/firestore')

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

async function diagnoseAdmissionConnection() {
  console.log("🔍 UCAES Admission Connection Diagnostic")
  console.log("=" .repeat(50))
  
  try {
    // Step 1: Test basic Firebase connection
    console.log("\n1. Testing Firebase Connection...")
    const testRef = doc(db, 'system-test', 'connection-test')
    await setDoc(testRef, {
      timestamp: serverTimestamp(),
      message: "Connection test successful"
    })
    console.log("✅ Firebase connection successful")
    
    // Step 2: Check centralized academic year system
    console.log("\n2. Checking Centralized Academic Year System...")
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data()
      console.log("✅ Centralized system found:")
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`)
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`)
      console.log(`   Current Semester: ${systemData.currentSemester}`)
      console.log(`   Last Updated: ${systemData.lastUpdated?.toDate() || 'Unknown'}`)
      
      // Check if the referenced academic year exists
      if (systemData.currentAcademicYearId) {
        const yearRef = doc(db, 'academic-years', systemData.currentAcademicYearId)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data()
          console.log("✅ Academic year document found:")
          console.log(`   Year: ${yearData.year || yearData.displayName}`)
          console.log(`   Admission Status: ${yearData.admissionStatus}`)
          console.log(`   Status: ${yearData.status}`)
        } else {
          console.log("❌ Referenced academic year document not found")
          console.log("   This could cause connection issues!")
        }
      }
    } else {
      console.log("⚠️ Centralized system not found, checking legacy system...")
      
      // Check legacy system
      const settingsRef = doc(db, 'academic-settings', 'current-year')
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        console.log("✅ Legacy system found:")
        console.log(`   Current Year: ${data.currentYear}`)
        console.log(`   Updated At: ${data.updatedAt?.toDate() || 'Unknown'}`)
        
        // Check if the academic year document exists
        const yearRef = doc(db, 'academic-years', data.currentYear)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data()
          console.log("✅ Academic year document found:")
          console.log(`   Admission Status: ${yearData.admissionStatus}`)
        } else {
          console.log("❌ Academic year document not found")
        }
      } else {
        console.log("❌ No academic year configuration found!")
        console.log("   This will cause admission page connection issues!")
      }
    }
    
    // Step 3: Test admission status check (like the admission website does)
    console.log("\n3. Testing Admission Status Check...")
    const admissionStatus = await checkAdmissionStatus()
    console.log("📊 Admission Status Result:")
    console.log(`   Is Open: ${admissionStatus.isOpen}`)
    console.log(`   Current Year: ${admissionStatus.currentYear}`)
    console.log(`   Status: ${admissionStatus.admissionStatus}`)
    console.log(`   Message: ${admissionStatus.message}`)
    
    // Step 4: Check for potential issues
    console.log("\n4. Checking for Potential Issues...")
    
    let issuesFound = 0
    
    // Check if both systems exist (could cause conflicts)
    if (systemConfigDoc.exists()) {
      const settingsRef = doc(db, 'academic-settings', 'current-year')
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        console.log("⚠️ Both centralized and legacy systems exist")
        console.log("   This could cause synchronization issues")
        issuesFound++
        
        const systemData = systemConfigDoc.data()
        const legacyData = settingsDoc.data()
        
        if (systemData.currentAcademicYear !== legacyData.currentYear) {
          console.log("❌ Academic year mismatch between systems!")
          console.log(`   Centralized: ${systemData.currentAcademicYear}`)
          console.log(`   Legacy: ${legacyData.currentYear}`)
          issuesFound++
        }
      }
    }
    
    // Step 5: Provide recommendations
    console.log("\n5. Recommendations...")
    
    if (issuesFound === 0) {
      console.log("✅ No issues found! The admission connection should work properly.")
    } else {
      console.log(`⚠️ Found ${issuesFound} potential issues.`)
      console.log("\nRecommendations:")
      console.log("1. Ensure director sets current academic year in Academic Affairs")
      console.log("2. Verify the academic year has admission status set")
      console.log("3. Check network connectivity between admission website and Firebase")
      console.log("4. Clear browser cache and cookies")
      console.log("5. Run the system config update script to sync both systems")
    }
    
    console.log("\n🎉 Diagnosis Complete!")
    
  } catch (error) {
    console.error("❌ Diagnostic failed:", error)
    console.log("\nPossible causes:")
    console.log("- Network connectivity issues")
    console.log("- Firebase configuration mismatch")
    console.log("- Permission issues")
    console.log("- Invalid academic year setup")
  }
}

// Same admission status check as the actual admission website
async function checkAdmissionStatus() {
  try {
    // Try centralized system first
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    let currentYear = null
    let yearData = null
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data()
      currentYear = systemData.currentAcademicYearId
      
      if (currentYear) {
        const yearRef = doc(db, 'academic-years', currentYear)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          yearData = yearDoc.data()
        }
      }
    }
    
    // Fallback to legacy system
    if (!currentYear || !yearData) {
      const settingsRef = doc(db, 'academic-settings', 'current-year')
      const settingsDoc = await getDoc(settingsRef)
      
      if (!settingsDoc.exists()) {
        return {
          isOpen: false,
          message: "No admission period is currently configured"
        }
      }
      
      const data = settingsDoc.data()
      currentYear = data.currentYear
      
      const yearRef = doc(db, 'academic-years', currentYear)
      const yearDoc = await getDoc(yearRef)
      
      if (!yearDoc.exists()) {
        return {
          isOpen: false,
          message: "Admission period not found"
        }
      }
      
      yearData = yearDoc.data()
    }
    
    const isOpen = yearData.admissionStatus === 'open'
    
    return {
      isOpen,
      currentYear: yearData.displayName || yearData.year || currentYear,
      admissionStatus: yearData.admissionStatus,
      message: isOpen ? "Admissions are open" : "Admissions are currently closed"
    }
  } catch (error) {
    return {
      isOpen: false,
      message: `Connection error: ${error.message}`
    }
  }
}

// Run the diagnostic
diagnoseAdmissionConnection()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Diagnostic failed:", error)
    process.exit(1)
  })








