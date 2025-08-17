const { initializeApp } = require('firebase/app')
const { getFirestore, doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore')

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

async function resetApplicationCounter() {
  try {
    console.log("🔄 Resetting application counter for current academic year...")
    
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
    
    // Reset the counter for this year
    const yearKey = `UCAES${currentYear}`
    const counterRef = doc(db, "application-counters", yearKey)
    
    // Check if counter exists
    const counterDoc = await getDoc(counterRef)
    
    if (counterDoc.exists()) {
      console.log(`⚠️ Found existing counter for ${yearKey}:`, counterDoc.data())
      
      // Delete the existing counter
      await deleteDoc(counterRef)
      console.log(`✅ Deleted existing counter for ${yearKey}`)
    }
    
    // Create new counter starting from 1
    await setDoc(counterRef, {
      lastNumber: 1,
      year: currentYear,
      createdAt: new Date(),
      lastUpdated: new Date()
    })
    
    console.log(`✅ Reset application counter for ${yearKey} to start from 0001`)
    console.log(`📋 Next application ID will be: ${yearKey}0001`)
    
  } catch (error) {
    console.error("❌ Error resetting application counter:", error)
  }
}

// Run the reset
resetApplicationCounter()
  .then(() => {
    console.log("🎉 Application counter reset complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Reset failed:", error)
    process.exit(1)
  }) 