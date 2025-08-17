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

async function fixAdmissionConnection() {
  console.log("🔧 UCAES Admission Connection Fix")
  console.log("=" .repeat(40))
  
  try {
    // Step 1: Check current state
    console.log("\n1. Checking current system state...")
    
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    const settingsRef = doc(db, 'academic-settings', 'current-year')
    const settingsDoc = await getDoc(settingsRef)
    
    let needsSync = false
    let currentAcademicYear = null
    let currentAcademicYearId = null
    
    // Step 2: Determine the source of truth
    if (systemConfigDoc.exists()) {
      console.log("✅ Centralized system found - using as source of truth")
      const systemData = systemConfigDoc.data()
      currentAcademicYear = systemData.currentAcademicYear
      currentAcademicYearId = systemData.currentAcademicYearId
      
      // Check if legacy system needs updating
      if (settingsDoc.exists()) {
        const legacyData = settingsDoc.data()
        if (legacyData.currentYear !== currentAcademicYearId) {
          console.log("⚠️ Legacy system out of sync - will update")
          needsSync = true
        }
      } else {
        console.log("⚠️ Legacy system missing - will create")
        needsSync = true
      }
      
    } else if (settingsDoc.exists()) {
      console.log("⚠️ Only legacy system found - will create centralized system")
      const legacyData = settingsDoc.data()
      currentAcademicYearId = legacyData.currentYear
      
      // Get the academic year to find display name
      const yearRef = doc(db, 'academic-years', currentAcademicYearId)
      const yearDoc = await getDoc(yearRef)
      
      if (yearDoc.exists()) {
        const yearData = yearDoc.data()
        currentAcademicYear = yearData.displayName || yearData.year || currentAcademicYearId
      } else {
        console.log("❌ Academic year document not found!")
        return
      }
      
      needsSync = true
      
    } else {
      console.log("❌ No academic year configuration found!")
      console.log("Please set up an academic year in the Academic Affairs portal first.")
      return
    }
    
    // Step 3: Verify academic year document exists
    console.log(`\n2. Verifying academic year document: ${currentAcademicYearId}`)
    const yearRef = doc(db, 'academic-years', currentAcademicYearId)
    const yearDoc = await getDoc(yearRef)
    
    if (!yearDoc.exists()) {
      console.log("❌ Academic year document not found!")
      console.log("This will cause admission connection issues.")
      console.log("Please create the academic year in Academic Affairs first.")
      return
    }
    
    const yearData = yearDoc.data()
    console.log("✅ Academic year document found:")
    console.log(`   Year: ${yearData.year || yearData.displayName}`)
    console.log(`   Admission Status: ${yearData.admissionStatus}`)
    console.log(`   Status: ${yearData.status}`)
    
    // Step 4: Synchronize systems if needed
    if (needsSync) {
      console.log("\n3. Synchronizing systems...")
      
      // Update or create centralized system
      const systemConfigData = {
        currentAcademicYear: currentAcademicYear,
        currentAcademicYearId: currentAcademicYearId,
        currentSemester: "First Semester", // Default
        lastUpdated: serverTimestamp(),
        updatedBy: "system-sync"
      }
      
      await setDoc(systemConfigRef, systemConfigData)
      console.log("✅ Centralized system updated")
      
      // Update or create legacy system
      const legacyData = {
        currentYear: currentAcademicYearId,
        updatedAt: serverTimestamp(),
        updatedBy: "system-sync"
      }
      
      await setDoc(settingsRef, legacyData)
      console.log("✅ Legacy system updated")
      
    } else {
      console.log("✅ Systems are already synchronized")
    }
    
    // Step 5: Test the admission status check
    console.log("\n4. Testing admission status check...")
    const admissionStatus = await checkAdmissionStatus()
    
    if (admissionStatus.isOpen !== undefined) {
      console.log("✅ Admission status check successful:")
      console.log(`   Is Open: ${admissionStatus.isOpen}`)
      console.log(`   Current Year: ${admissionStatus.currentYear}`)
      console.log(`   Status: ${admissionStatus.admissionStatus}`)
      console.log(`   Message: ${admissionStatus.message}`)
    } else {
      console.log("❌ Admission status check failed")
      console.log(`   Error: ${admissionStatus.message}`)
    }
    
    // Step 6: Final verification
    console.log("\n5. Final verification...")
    
    // Test basic Firebase operations
    const testRef = doc(db, 'system-test', 'admission-connection-test')
    await setDoc(testRef, {
      timestamp: serverTimestamp(),
      testType: "admission-connection",
      result: "success"
    })
    
    console.log("✅ Firebase operations working correctly")
    console.log("\n🎉 Admission connection fix completed!")
    console.log("\nNext steps:")
    console.log("1. Test the admission page by clicking on it")
    console.log("2. Verify that it shows the correct admission status")
    console.log("3. If issues persist, check browser console for errors")
    console.log("4. Ensure network connectivity to Firebase")
    
  } catch (error) {
    console.error("❌ Fix failed:", error)
    console.log("\nTroubleshooting steps:")
    console.log("1. Check Firebase configuration")
    console.log("2. Verify network connectivity")
    console.log("3. Check Firebase permissions")
    console.log("4. Run the diagnostic script first")
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

// Run the fix
fixAdmissionConnection()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Fix failed:", error)
    process.exit(1)
  })








