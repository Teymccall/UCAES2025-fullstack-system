// Simple script to update the academic year configuration
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config (you'll need to add your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

async function updateAcademicYear() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Update the system configuration
    const configRef = doc(db, "systemConfig", "academicPeriod");
    await setDoc(configRef, {
      currentAcademicYear: "2024-2025",
      currentAcademicYearId: "2024-2025",
      currentSemester: "First Semester",
      currentSemesterId: "first-2024-2025",
      currentProgramType: "Regular",
      lastUpdated: serverTimestamp(),
      updatedBy: "system_fix"
    });
    
    console.log("✅ Academic year updated to 2024-2025");
  } catch (error) {
    console.error("❌ Error updating academic year:", error);
  }
}

updateAcademicYear();

