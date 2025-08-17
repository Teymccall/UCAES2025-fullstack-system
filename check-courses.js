// check-courses.js
// Script to check if courses exist in Firebase

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to check if courses for a program exist
async function checkProgramCourses(programName) {
  console.log(`\nChecking courses for program: ${programName}`);
  
  try {
    // First, get the program ID
    const programsRef = collection(db, "academic-programs");
    const programQuery = query(programsRef, where("name", "==", programName));
    const programSnapshot = await getDocs(programQuery);
    
    if (programSnapshot.empty) {
      console.log(`Program not found: ${programName}`);
      return;
    }
    
    const programId = programSnapshot.docs[0].id;
    const programCode = programSnapshot.docs[0].data().code;
    console.log(`Found program: ${programName} (ID: ${programId}, Code: ${programCode})`);
    
    // Check courses for this program
    const coursesRef = collection(db, "academic-courses");
    const courseQuery = query(coursesRef, where("programId", "==", programId));
    const courseSnapshot = await getDocs(courseQuery);
    
    if (courseSnapshot.empty) {
      console.log(`No courses found for program: ${programName}`);
      return;
    }
    
    console.log(`Found ${courseSnapshot.size} courses for program: ${programName}`);
    
    // Sample a few courses
    console.log("\nSample courses:");
    courseSnapshot.docs.slice(0, 5).forEach(doc => {
      const courseData = doc.data();
      console.log(`- ${courseData.code}: ${courseData.title} (Level: ${courseData.level}, Semester: ${courseData.semester})`);
    });
    
    // Count courses per level and semester
    const courseCounts = {};
    courseSnapshot.forEach(doc => {
      const courseData = doc.data();
      const key = `Level ${courseData.level}, Semester ${courseData.semester}`;
      if (!courseCounts[key]) courseCounts[key] = 0;
      courseCounts[key]++;
    });
    
    console.log("\nCourse distribution:");
    Object.keys(courseCounts).forEach(key => {
      console.log(`- ${key}: ${courseCounts[key]} courses`);
    });
    
  } catch (error) {
    console.error(`Error checking courses for ${programName}:`, error);
  }
}

// Function to check if a specific course exists
async function checkSpecificCourse(courseCode) {
  console.log(`\nChecking for course: ${courseCode}`);
  
  try {
    const coursesRef = collection(db, "academic-courses");
    const courseQuery = query(coursesRef, where("code", "==", courseCode));
    const courseSnapshot = await getDocs(courseQuery);
    
    if (courseSnapshot.empty) {
      console.log(`Course not found: ${courseCode}`);
      return false;
    } else {
      const courseData = courseSnapshot.docs[0].data();
      console.log(`Found course: ${courseCode} - ${courseData.title}`);
      console.log(`- Credits: ${courseData.credits}`);
      console.log(`- Level: ${courseData.level}, Semester: ${courseData.semester}`);
      return true;
    }
  } catch (error) {
    console.error(`Error checking course ${courseCode}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log("Checking curriculum courses in Firebase...");
    
    // Check if programs exist
    const programsToCheck = [
      "BSc. Sustainable Agriculture",
      "BSc. Environmental Science and Management"
    ];
    
    for (const program of programsToCheck) {
      await checkProgramCourses(program);
    }
    
    // Check a few sample courses from the curriculum
    console.log("\n\nChecking sample courses from curriculum:");
    const samplesToCheck = ["AGM 151", "ESM 151", "AGM 451", "ESM 451"];
    
    for (const code of samplesToCheck) {
      await checkSpecificCourse(code);
    }
    
    console.log("\nCheck completed.");
  } catch (error) {
    console.error("Error during check:", error);
  }
}

// Run the script
main(); 