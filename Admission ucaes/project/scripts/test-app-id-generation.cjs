const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc } = require('firebase/firestore')

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

async function testApplicationIdGeneration() {
  console.log("🧪 Testing Application ID Generation Logic")
  console.log("=" .repeat(50))
  
  try {
    // Simulate the application ID generation logic
    let academicYear = new Date().getFullYear().toString()
    console.log(`🗓️ Default year (current): ${academicYear}`)
    
    // Try centralized system first
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data()
      console.log(`📊 System Config Data:`)
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`)
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`)
      
      // First try to get the admission year from the academic year document
      if (systemData.currentAcademicYearId) {
        console.log(`\n🔍 Checking academic year document...`)
        const yearRef = doc(db, 'academic-years', systemData.currentAcademicYearId)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data()
          console.log(`📋 Academic Year Document:`)
          console.log(`   Year: ${yearData.year}`)
          console.log(`   Display Name: ${yearData.displayName}`)
          
          // Use the actual year from the document (e.g., "2026-2027" → "2026")
          if (yearData.year) {
            const yearMatch = yearData.year.match(/(\d{4})/)
            if (yearMatch) {
              academicYear = yearMatch[1]
              console.log(`✅ Using admission year from academic year document: ${academicYear}`)
            }
          }
        }
      }
      
      // Fallback: Extract year from display name like "2025/2026" → use second year "2026" for admission
      if (academicYear === new Date().getFullYear().toString()) {
        console.log(`\n⚠️ No year from document, using display format fallback...`)
        const displayYear = systemData.currentAcademicYear
        if (displayYear) {
          // For academic years like "2025/2026", use the second year (2026) for admissions
          const yearMatch = displayYear.match(/\d{4}\/(\d{4})/)
          if (yearMatch) {
            academicYear = yearMatch[1] // Use the second year (admission year)
            console.log(`✅ Using admission year from display format: ${academicYear}`)
          } else {
            // Single year format, use as-is
            const singleYearMatch = displayYear.match(/(\d{4})/)
            if (singleYearMatch) {
              academicYear = singleYearMatch[1]
              console.log(`✅ Using single year format: ${academicYear}`)
            }
          }
        }
      }
    }
    
    console.log(`\n🎯 Final Result:`)
    console.log(`   Academic Year for Application ID: ${academicYear}`)
    console.log(`   Expected Application ID format: UCAES${academicYear}XXXX`)
    console.log(`   Example: UCAES${academicYear}0001`)
    
    // Verify the expected format
    const expectedYear = "2026"
    if (academicYear === expectedYear) {
      console.log(`✅ SUCCESS: Application ID will use correct year ${expectedYear}`)
      console.log(`✅ New applications will get IDs like: UCAES${expectedYear}0001, UCAES${expectedYear}0002, etc.`)
    } else {
      console.log(`❌ ISSUE: Expected year ${expectedYear}, but got ${academicYear}`)
    }
    
    console.log(`\n📝 Summary:`)
    console.log(`- Current academic year in system: 2025/2026`)
    console.log(`- Academic year document shows: 2026-2027`)
    console.log(`- Admission year (for new students): 2026`)
    console.log(`- Application IDs should use: ${academicYear}`)
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run the test
testApplicationIdGeneration()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Test failed:", error)
    process.exit(1)
  })
