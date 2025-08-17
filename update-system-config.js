// This script initializes or updates the system config collection for academic year centralization
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, doc, getDoc, setDoc, getDocs, limit, serverTimestamp } = require('firebase/firestore');

// Updated Firebase configuration with correct values
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateSystemConfig() {
  try {
    console.log("Starting system config update...");
    
    // Check if config already exists
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const configSnap = await getDoc(configRef);
    console.log("Config exists:", configSnap.exists());
    
    // Get current active academic year from existing system
    console.log("Fetching active academic year...");
    const yearsRef = collection(db, "academic-years");
    const q = query(yearsRef, where("status", "==", "active"), limit(1));
    const snapshot = await getDocs(q);
    
    console.log("Found active years:", snapshot.size);
    
    if (!snapshot.empty) {
      const activeYear = snapshot.docs[0];
      console.log("Active year document ID:", activeYear.id);
      console.log("Active year data:", JSON.stringify(activeYear.data()));
      
      const yearData = activeYear.data();
      console.log("Year value:", yearData.year);
      
      // Find active semester if any
      console.log("Fetching active semester...");
      const semestersRef = collection(db, "academic-semesters");
      const semQ = query(
        semestersRef, 
        where("academicYear", "==", activeYear.id),
        where("status", "==", "active"),
        limit(1)
      );
      const semSnapshot = await getDocs(semQ);
      console.log("Found active semesters:", semSnapshot.size);
      
      let semesterId = null;
      let semesterName = null;
      
      if (!semSnapshot.empty) {
        const activeSem = semSnapshot.docs[0];
        semesterId = activeSem.id;
        semesterName = activeSem.data().name;
        console.log(`Found active semester: ${semesterName} (${semesterId})`);
        console.log("Semester data:", JSON.stringify(activeSem.data()));
      } else {
        console.log("No active semester found");
      }
      
      // Use a fallback value for the academic year if it's undefined
      const academicYearValue = yearData.year || "2024/2025";
      console.log("Using academic year value:", academicYearValue);
      
      // Create or update the system config
      const configData = {
        currentAcademicYearId: activeYear.id,
        currentAcademicYear: academicYearValue,
        currentSemesterId: semesterId,
        currentSemester: semesterName,
        lastUpdated: serverTimestamp(),
        updatedBy: "system_initialization"
      };
      
      console.log("Writing config data:", JSON.stringify(configData));
      
      await setDoc(configRef, configData, { merge: true });
      
      if (configSnap.exists()) {
        console.log("System config updated successfully!");
      } else {
        console.log("System config created successfully!");
      }
      
      // Read back the config to verify
      const updatedSnap = await getDoc(configRef);
      console.log("Current system config:", updatedSnap.data());
    } else {
      console.log("ERROR: No active academic year found!");
    }
  } catch (error) {
    console.error("Error updating system config:", error);
  }
}

updateSystemConfig().catch(console.error); 