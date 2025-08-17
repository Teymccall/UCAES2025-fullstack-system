const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Your project's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
    authDomain: "ucaes2025.firebaseapp.com",
    databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
    projectId: "ucaes2025",
    storageBucket: "ucaes2025.appspot.com",
    messagingSenderId: "543217800581",
    appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
    measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyCourses() {
  console.log("Checking for courses in the academic-courses collection...");

  try {
    // First, get the program ID for "BSc. Environmental Science and Management"
    const programsRef = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsRef);
    
    let programId = null;
    programsSnapshot.forEach(doc => {
      const programData = doc.data();
      if (programData.name && programData.name.includes("Environmental Science and Management")) {
        programId = doc.id;
        console.log(`Found program: "${programData.name}" with ID: ${programId}`);
      }
    });

    if (!programId) {
      console.log("Could not find the Environmental Science and Management program ID.");
      return;
    }

    // Now check for courses with this programId
    const coursesRef = collection(db, 'academic-courses');
    const q = query(coursesRef, where("programId", "==", programId));
    const coursesSnapshot = await getDocs(q);

    if (coursesSnapshot.empty) {
      console.log(`No courses found for program ID: ${programId}`);
      return;
    }

    console.log(`Found ${coursesSnapshot.size} courses for this program.`);

    // Count courses by level and semester
    const courseCounts = {};
    
    coursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      const level = courseData.level;
      const semester = courseData.semester;
      
      if (!courseCounts[level]) {
        courseCounts[level] = {};
      }
      
      if (!courseCounts[level][semester]) {
        courseCounts[level][semester] = 0;
      }
      
      courseCounts[level][semester]++;
    });

    console.log("\nCourse distribution by level and semester:");
    for (const level in courseCounts) {
      console.log(`\nLevel ${level}:`);
      for (const semester in courseCounts[level]) {
        console.log(`  Semester ${semester}: ${courseCounts[level][semester]} courses`);
      }
    }

    // Check specifically for Level 100, Semester 1
    const level100Semester1Query = query(
      coursesRef, 
      where("programId", "==", programId),
      where("level", "==", 100),
      where("semester", "==", 1)
    );
    
    const level100Semester1Snapshot = await getDocs(level100Semester1Query);
    
    console.log(`\nLevel 100, Semester 1: ${level100Semester1Snapshot.size} courses`);
    
    if (level100Semester1Snapshot.size > 0) {
      console.log("\nHere are the first 5 courses for Level 100, Semester 1:");
      level100Semester1Snapshot.docs.slice(0, 5).forEach(doc => {
        const courseData = doc.data();
        console.log(`- ${courseData.code}: ${courseData.title || courseData.name}`);
      });
    }

  } catch (error) {
    console.error("Error verifying courses:", error);
  }
}

verifyCourses(); 