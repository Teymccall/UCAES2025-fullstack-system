// Script to check the current registration counter status
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase.js"

async function checkRegistrationCounter() {
  try {
    const year = new Date().getFullYear()
    const yearKey = `UCAES${year}`
    
    console.log("🔍 CHECKING REGISTRATION COUNTER STATUS")
    console.log("📅 Year:", year)
    console.log("🔑 Counter key:", yearKey)
    
    // Get the counter document
    const counterRef = doc(db, "registration-counters", yearKey)
    const counterDoc = await getDoc(counterRef)
    
    if (counterDoc.exists()) {
      const data = counterDoc.data()
      console.log("✅ Counter document found!")
      console.log("📊 Current data:", data)
      console.log("🔢 Last number used:", data.lastNumber)
      console.log("📅 Next number will be:", data.lastNumber + 1)
      console.log("📋 Next registration number:", `UCAES${year}${(data.lastNumber + 1).toString().padStart(4, '0')}`)
    } else {
      console.log("❌ No counter document found for this year")
      console.log("💡 This means the counter hasn't been initialized yet")
      console.log("📋 First student will get: UCAES" + year + "0001")
    }
    
  } catch (error) {
    console.error("❌ Error checking registration counter:", error)
  }
}

// Run the check
checkRegistrationCounter()
  .then(() => {
    console.log("🎉 Check completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Check failed:", error)
    process.exit(1)
  }) 