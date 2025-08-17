const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc } = require('firebase/firestore')

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

async function testCounter() {
  try {
    console.log("🔍 Checking current application counter...")
    
    // Get current academic year
    const settingsRef = doc(db, 'academic-settings', 'current-year')
    const settingsDoc = await getDoc(settingsRef)
    
    if (!settingsDoc.exists()) {
      console.log("❌ No current academic year found")
      return
    }
    
    const data = settingsDoc.data()
    const currentYear = data.currentYear
    console.log(`📅 Current academic year: ${currentYear}`)
    
    // Check the counter for this year
    const yearKey = `UCAES${currentYear}`
    const counterRef = doc(db, "application-counters", yearKey)
    const counterDoc = await getDoc(counterRef)
    
    if (counterDoc.exists()) {
      const counterData = counterDoc.data()
      console.log(`⚠️ Found existing counter for ${yearKey}:`, counterData)
      console.log(`📊 Current last number: ${counterData.lastNumber}`)
      console.log(`📋 Next application ID would be: ${yearKey}${(counterData.lastNumber + 1).toString().padStart(4, '0')}`)
    } else {
      console.log(`✅ No counter found for ${yearKey} - will start from 0001`)
      console.log(`📋 Next application ID will be: ${yearKey}0001`)
    }
    
  } catch (error) {
    console.error("❌ Error checking counter:", error)
  }
}

// Run the test
testCounter()
  .then(() => {
    console.log("🎉 Counter check complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Check failed:", error)
    process.exit(1)
  }) 