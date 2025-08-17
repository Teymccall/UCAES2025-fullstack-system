const { initializeApp } = require("firebase/app")
const { getFirestore, collection, getDocs, query, orderBy, limit } = require("firebase/firestore")

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

async function examineFirestoreData() {
  try {
    console.log("🔍 Examining Firestore data...")
    console.log("======================================")
    
    // Get all student registrations
    console.log("\n📋 Fetching all student registrations...")
    const registrationsRef = collection(db, "student-registrations")
    const q = query(registrationsRef, orderBy("registrationDate", "desc"), limit(10))
    const querySnapshot = await getDocs(q)
    
    console.log(`Found ${querySnapshot.size} registrations (showing last 10):\n`)
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data()
      console.log(`--- Registration ${index + 1} ---`)
      console.log(`🆔 Document ID: ${doc.id}`)
      console.log(`📋 Registration Number: ${data.registrationNumber}`)
      console.log(`👤 Name: ${data.surname} ${data.otherNames}`)
      console.log(`📧 Email: ${data.email}`)
      console.log(`📞 Mobile: ${data.mobile}`)
      console.log(`🏫 Programme: ${data.programme}`)
      console.log(`📅 Registration Date: ${data.registrationDate?.toDate?.() || data.registrationDate}`)
      console.log(`📊 Status: ${data.status}`)
      if (data.authUid) {
        console.log(`🔐 Auth UID: ${data.authUid}`)
      }
      console.log("")
    })
    
    // Check for specific registration ID
    console.log("\n🔍 Checking for specific registration ID: bZX9L8N2CTk8rwW5LGRY")
    const specificQuery = query(registrationsRef)
    const allDocs = await getDocs(specificQuery)
    
    let foundSpecific = false
    allDocs.forEach((doc) => {
      if (doc.id === "bZX9L8N2CTk8rwW5LGRY") {
        foundSpecific = true
        const data = doc.data()
        console.log("✅ Found the specific registration:")
        console.log(`👤 Name: ${data.surname} ${data.otherNames}`)
        console.log(`📧 Email: ${data.email}`)
        console.log(`📋 Registration Number: ${data.registrationNumber}`)
        console.log(`📅 Date: ${data.registrationDate?.toDate?.() || data.registrationDate}`)
      }
    })
    
    if (!foundSpecific) {
      console.log("❌ Specific registration ID not found in database")
    }
    
    // Also check students collection
    console.log("\n📋 Checking students collection...")
    const studentsRef = collection(db, "students")
    const studentsSnapshot = await getDocs(query(studentsRef, limit(5)))
    
    console.log(`Found ${studentsSnapshot.size} students (showing first 5):\n`)
    
    studentsSnapshot.forEach((doc, index) => {
      const data = doc.data()
      console.log(`--- Student ${index + 1} ---`)
      console.log(`🆔 Document ID: ${doc.id}`)
      console.log(`👤 Name: ${data.surname} ${data.otherNames}`)
      console.log(`📧 Email: ${data.email}`)
      console.log(`📋 Registration Number: ${data.registrationNumber || 'N/A'}`)
      console.log(`📅 Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`)
      console.log("")
    })
    
  } catch (error) {
    console.error("❌ Error examining Firestore data:", error)
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)
  }
}

// Run the examination
examineFirestoreData()
  .then(() => {
    console.log("📊 Data examination completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Examination failed:", error)
    process.exit(1)
  }) 