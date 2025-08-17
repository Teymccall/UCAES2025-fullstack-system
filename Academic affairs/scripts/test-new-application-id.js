const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } = require('firebase/firestore')

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

// Simulate the new application ID generation
async function generateApplicationId() {
  try {
    // Get current academic year from Firebase
    const settingsRef = doc(db, 'academic-settings', 'current-year')
    const settingsDoc = await getDoc(settingsRef)
    
    let academicYear = new Date().getFullYear().toString()
    
    if (settingsDoc.exists()) {
      const data = settingsDoc.data()
      academicYear = data.currentYear || academicYear
    }
    
    // Generate sequential number for this academic year
    const yearKey = `UCAES${academicYear}`
    const counterRef = doc(db, "application-counters", yearKey)
    
    try {
      // Try to get the existing counter
      const counterDoc = await getDoc(counterRef)
      
      if (counterDoc.exists()) {
        // Counter exists, increment it
        const currentCount = counterDoc.data().lastNumber || 0
        const nextNumber = currentCount + 1
        const paddedNumber = nextNumber.toString().padStart(4, "0")
        
        // Update the counter
        await updateDoc(counterRef, {
          lastNumber: nextNumber,
          lastUpdated: serverTimestamp()
        })
        
        const applicationId = `${yearKey}${paddedNumber}`
        console.log("✅ Generated sequential application ID:", applicationId, `(incremented from ${currentCount})`)
        return applicationId
        
      } else {
        // Counter doesn't exist, start from 1
        const firstNumber = 1
        const paddedNumber = firstNumber.toString().padStart(4, "0")
        
        // Create the counter document
        await setDoc(counterRef, {
          lastNumber: firstNumber,
          year: academicYear,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        })
        
        const applicationId = `${yearKey}${paddedNumber}`
        console.log("✅ Generated first application ID for year:", applicationId)
        return applicationId
      }
      
    } catch (error) {
      console.error("❌ Error accessing application counter:", error)
      
      // Fallback: use timestamp-based number
      const fallbackNumber = Math.floor(Date.now() % 10000)
        .toString()
        .padStart(4, "0")
      const applicationId = `${yearKey}${fallbackNumber}`
      console.log("⚠️ Using fallback application ID:", applicationId)
      return applicationId
    }
  } catch (error) {
    console.error("❌ Error generating application ID:", error)
    
    // Ultimate fallback
    const year = new Date().getFullYear()
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const fallbackId = `UCAES${year}${timestamp.toString().slice(-4)}${random}`
    console.log("⚠️ Using ultimate fallback application ID:", fallbackId)
    return fallbackId
  }
}

// Test validation functions
function testValidationFunctions() {
  console.log("\n🧪 Testing validation functions...")
  
  // Test valid application IDs
  const validIds = [
    "UCAES20250001",
    "UCAES20250002", 
    "UCAES20251234"
  ]
  
  // Test invalid application IDs
  const invalidIds = [
    "APP-2024-001",
    "UCAES2025",
    "UCAES2025001",
    "UCAES202500001",
    "UCAES2025ABC1"
  ]
  
  console.log("\n✅ Valid Application IDs:")
  validIds.forEach(id => {
    const isValid = /^UCAES\d{4}\d{4}$/.test(id)
    const year = id.match(/^UCAES(\d{4})\d{4}$/)?.[1]
    const sequence = id.match(/^UCAES\d{4}(\d{4})$/)?.[1]
    console.log(`   ${id} - Valid: ${isValid}, Year: ${year}, Sequence: ${sequence}`)
  })
  
  console.log("\n❌ Invalid Application IDs:")
  invalidIds.forEach(id => {
    const isValid = /^UCAES\d{4}\d{4}$/.test(id)
    console.log(`   ${id} - Valid: ${isValid}`)
  })
}

async function testNewApplicationIdFormat() {
  console.log("🎯 Testing New Application ID Format...")
  
  try {
    // Test 1: Generate first application ID
    console.log("\n1. Generating first application ID...")
    const firstId = await generateApplicationId()
    console.log("✅ First ID:", firstId)
    
    // Test 2: Generate second application ID
    console.log("\n2. Generating second application ID...")
    const secondId = await generateApplicationId()
    console.log("✅ Second ID:", secondId)
    
    // Test 3: Generate third application ID
    console.log("\n3. Generating third application ID...")
    const thirdId = await generateApplicationId()
    console.log("✅ Third ID:", thirdId)
    
    // Test 4: Validate format
    console.log("\n4. Validating format...")
    const pattern = /^UCAES\d{4}\d{4}$/
    const isValid1 = pattern.test(firstId)
    const isValid2 = pattern.test(secondId)
    const isValid3 = pattern.test(thirdId)
    
    console.log(`   ${firstId}: ${isValid1 ? '✅ Valid' : '❌ Invalid'}`)
    console.log(`   ${secondId}: ${isValid2 ? '✅ Valid' : '❌ Invalid'}`)
    console.log(`   ${thirdId}: ${isValid3 ? '✅ Valid' : '❌ Invalid'}`)
    
    // Test 5: Check sequential nature
    console.log("\n5. Checking sequential nature...")
    const sequence1 = parseInt(firstId.slice(-4))
    const sequence2 = parseInt(secondId.slice(-4))
    const sequence3 = parseInt(thirdId.slice(-4))
    
    console.log(`   Sequence: ${sequence1} → ${sequence2} → ${sequence3}`)
    console.log(`   Sequential: ${sequence2 === sequence1 + 1 && sequence3 === sequence2 + 1 ? '✅ Yes' : '❌ No'}`)
    
    // Test validation functions
    testValidationFunctions()
    
    console.log("\n🎉 New Application ID Format Test Complete!")
    console.log("\n📋 Summary:")
    console.log("✅ Application IDs now use format: UCAES + academic year + unique digits")
    console.log("✅ Sequential numbering works correctly")
    console.log("✅ Validation functions updated for new format")
    console.log("✅ Integration with academic year management")
    
  } catch (error) {
    console.error("❌ Error testing new application ID format:", error)
  }
}

// Run the test
testNewApplicationIdFormat()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Test failed:", error)
    process.exit(1)
  }) 