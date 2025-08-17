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

async function testAdmissionSettingsAPI() {
  console.log("🧪 Testing Admission Settings API Logic")
  console.log("=" .repeat(50))
  
  try {
    // Step 1: Test systemConfig access
    console.log("\n1. Testing systemConfig access...")
    const systemConfigRef = doc(db, 'systemConfig', 'academicPeriod')
    const systemConfigDoc = await getDoc(systemConfigRef)
    
    if (systemConfigDoc.exists()) {
      const systemData = systemConfigDoc.data()
      console.log("✅ systemConfig found:")
      console.log(`   Current Academic Year: ${systemData.currentAcademicYear}`)
      console.log(`   Current Academic Year ID: ${systemData.currentAcademicYearId}`)
      
      // Step 2: Test academic year document access
      if (systemData.currentAcademicYearId) {
        console.log("\n2. Testing academic year document access...")
        const yearRef = doc(db, 'academic-years', systemData.currentAcademicYearId)
        const yearDoc = await getDoc(yearRef)
        
        if (yearDoc.exists()) {
          const yearData = yearDoc.data()
          console.log("✅ Academic year document found:")
          console.log(`   Year: ${yearData.year}`)
          console.log(`   Display Name: ${yearData.displayName}`)
          console.log(`   Admission Status: ${yearData.admissionStatus}`)
          console.log(`   Status: ${yearData.status}`)
          
          // Step 3: Test building the currentYear object like the API does
          console.log("\n3. Testing currentYear object construction...")
          const currentYear = {
            id: yearDoc.id,
            year: yearData?.year || '',
            displayName: yearData?.displayName || yearData?.year || '',
            admissionStatus: yearData?.admissionStatus || 'closed',
            startDate: yearData?.startDate || '',
            endDate: yearData?.endDate || '',
            maxApplications: yearData?.maxApplications || null,
            currentApplications: yearData?.currentApplications || 0,
            admissionStartDate: yearData?.admissionStartDate || '',
            admissionEndDate: yearData?.admissionEndDate || ''
          }
          console.log("✅ currentYear object constructed successfully:")
          console.log(JSON.stringify(currentYear, null, 2))
          
        } else {
          console.log("❌ Academic year document not found!")
          console.log(`   Document ID: ${systemData.currentAcademicYearId}`)
        }
      } else {
        console.log("❌ No currentAcademicYearId in systemConfig!")
      }
    } else {
      console.log("❌ systemConfig document not found!")
    }
    
    // Step 4: Test getting all academic years
    console.log("\n4. Testing academic years collection access...")
    const { collection, getDocs } = require('firebase/firestore')
    
    const yearsCollection = collection(db, 'academic-years')
    const yearsSnapshot = await getDocs(yearsCollection)
    
    console.log(`✅ Found ${yearsSnapshot.docs.length} academic year documents`)
    
    if (yearsSnapshot.docs.length > 0) {
      console.log("\nSample academic years:")
      yearsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data()
        console.log(`   ${index + 1}. ID: ${doc.id}`)
        console.log(`      Year: ${data.year}`)
        console.log(`      Display Name: ${data.displayName}`)
        console.log(`      Admission Status: ${data.admissionStatus}`)
      })
    }
    
    // Step 5: Simulate the API response construction
    console.log("\n5. Simulating API response construction...")
    
    const availableYears = yearsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        year: data.year || '',
        displayName: data.displayName || data.year || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        admissionStatus: data.admissionStatus || 'closed',
      }
    })
    
    // Sort in JavaScript
    availableYears.sort((a, b) => b.year.localeCompare(a.year))
    
    console.log(`✅ availableYears array constructed with ${availableYears.length} items`)
    
    console.log("\n🎉 All API logic tests passed!")
    console.log("\nThe issue might be:")
    console.log("1. Firebase Admin SDK configuration in the API route")
    console.log("2. Service account file path or permissions")
    console.log("3. Firebase Admin initialization issues")
    console.log("4. Next.js API route specific issues")
    
  } catch (error) {
    console.error("❌ Test failed:", error)
    console.log("\nError details:")
    console.log(`   Message: ${error.message}`)
    console.log(`   Code: ${error.code || 'N/A'}`)
  }
}

// Run the test
testAdmissionSettingsAPI()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Test failed:", error)
    process.exit(1)
  })








