// Debug script to check system config data
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  databaseURL: "https://collage-of-agricuture-default-rtdb.firebaseio.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugSystemConfig() {
  try {
    console.log("🔍 Checking system config data...");
    
    // Check if the system config document exists
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const data = configSnap.data();
      console.log("✅ System config found:");
      console.log("   - Current Academic Year:", data.currentAcademicYear);
      console.log("   - Current Academic Year ID:", data.currentAcademicYearId);
      console.log("   - Current Semester:", data.currentSemester);
      console.log("   - Current Semester ID:", data.currentSemesterId);
      console.log("   - Last Updated:", data.lastUpdated);
      console.log("\n📋 Full data:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ System config document not found!");
      console.log("   The document path should be: systemConfig/academicPeriod");
    }
    
  } catch (error) {
    console.error("❌ Error checking system config:", error);
  }
  
  process.exit(0);
}

debugSystemConfig();























