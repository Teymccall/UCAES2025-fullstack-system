// Script to reset the registration counter to 0
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function resetRegistrationCounter() {
  try {
    const year = new Date().getFullYear()
    const yearKey = `UCAES${year}`
    
    console.log("🔄 RESETTING REGISTRATION COUNTER")
    console.log("📅 Year:", year)
    console.log("🔑 Counter key:", yearKey)
    
    // Reset the counter document to 0
    const counterRef = doc(db, "registration-counters", yearKey)
    
    await setDoc(counterRef, {
      lastNumber: 0, // Reset to 0, so next student gets 0001
      year: year,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      description: "Registration number counter for UCAES student registrations (RESET)"
    })
    
    console.log("✅ Registration counter reset successfully!")
    console.log("📋 Next student will get registration number: UCAES" + year + "0001")
    console.log("⚠️ WARNING: This will restart numbering from 0001")
    
  } catch (error) {
    console.error("❌ Error resetting registration counter:", error)
  }
}

// Run the reset
resetRegistrationCounter()
  .then(() => {
    console.log("🎉 Reset completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Reset failed:", error)
    process.exit(1)
  }) 