// Script to initialize the registration counter for the current year
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase.js"

async function initializeRegistrationCounter() {
  try {
    const year = new Date().getFullYear()
    const yearKey = `UCAES${year}`
    
    console.log("🔢 Initializing registration counter for year:", yearKey)
    
    // Create the counter document
    const counterRef = doc(db, "registration-counters", yearKey)
    
    await setDoc(counterRef, {
      lastNumber: 0, // Start from 0, so first student gets 0001
      year: year,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      description: "Registration number counter for UCAES student registrations"
    })
    
    console.log("✅ Registration counter initialized successfully!")
    console.log("📋 Next student will get registration number: UCAES" + year + "0001")
    
  } catch (error) {
    console.error("❌ Error initializing registration counter:", error)
  }
}

// Run the initialization
initializeRegistrationCounter()
  .then(() => {
    console.log("🎉 Registration counter setup completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Registration counter setup failed:", error)
    process.exit(1)
  }) 