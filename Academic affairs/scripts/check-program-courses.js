// Script to check if specific programs and courses exist in Firebase

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration from Academic affairs
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

// Programs to check
const programsToCheck = [
  {
    name: "BSc. Sustainable Agriculture",
    code: "BSC-AGRI",
  },
  {
    name: "BSc. Environmental Science and Management",
    code: "BSC-ESM",
  }
];

// Sample of courses to check for each program
const coursesToCheck = {
  "BSC-AGRI": [
    { code: "AGM 151", name: "Introduction to Soil Science" },
    { code: "AGM 153", name: "Introductory Botany" },
    { code: "AGM 155", name: "Principles of Crop Production" },
    { code: "AGM 152", name: "Principles of Land Surveying" },
    { code: "AGM 251", name: "Farming Systems and Natural Resources" }
  ],
  "BSC-ESM": [
    { code: "ESM 151", name: "Principles of Biochemistry" },
    { code: "ESM 153", name: "Principles of Environmental Science I" },
    { code: "ESM 155", name: "Introduction to Climatology" },
    { code: "ESM 152", name: "Principles of Environmental Science II" },
    { code: "ESM 251", name: "Geology" }
  ]
};

// Function to check if programs exist
async function checkPrograms() {
  try {
    console.log("\n=== CHECKING PROGRAMS ===");
    
    const programsCollection = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsCollection);
    
    if (programsSnapshot.empty) {
      console.log("No programs found in academic-programs collection.");
      return;
    }
    
    console.log(`Found ${programsSnapshot.size} programs in total.`);
    
    // Check for each specific program
    for (const program of programsToCheck) {
      let found = false;
      
      programsSnapshot.forEach(doc => {
        const programData = doc.data();
        if (
          (programData.code && programData.code === program.code) ||
          (programData.name && programData.name.includes(program.name))
        ) {
          found = true;
          console.log(`✅ FOUND PROGRAM: ${program.name} (${program.code})`);
          console.log(`   ID: ${doc.id}`);
          console.log(`   Details: ${JSON.stringify(programData, null, 2)}`);
        }
      });
      
      if (!found) {
        console.log(`❌ PROGRAM NOT FOUND: ${program.name} (${program.code})`);
      }
    }
  } catch (error) {
    console.error("Error checking programs:", error);
  }
}

// Function to check if courses exist
async function checkCourses() {
  try {
    console.log("\n=== CHECKING COURSES ===");
    
    const coursesCollection = collection(db, 'academic-courses');
    const coursesSnapshot = await getDocs(coursesCollection);
    
    // Also check the regular courses collection
    const regularCoursesCollection = collection(db, 'courses');
    const regularCoursesSnapshot = await getDocs(regularCoursesCollection);
    
    if (coursesSnapshot.empty && regularCoursesSnapshot.empty) {
      console.log("No courses found in either academic-courses or courses collections.");
      return;
    }
    
    console.log(`Found ${coursesSnapshot.size} courses in academic-courses collection.`);
    console.log(`Found ${regularCoursesSnapshot.size} courses in courses collection.`);
    
    // Check for each program's courses
    for (const [programCode, courses] of Object.entries(coursesToCheck)) {
      console.log(`\nChecking courses for program ${programCode}:`);
      
      for (const course of courses) {
        let found = false;
        let whereFound = null;
        let courseDetails = null;
        
        // Check in academic-courses
        coursesSnapshot.forEach(doc => {
          const courseData = doc.data();
          if (
            (courseData.code && courseData.code === course.code) ||
            (courseData.title && courseData.title.includes(course.name))
          ) {
            found = true;
            whereFound = 'academic-courses';
            courseDetails = courseData;
          }
        });
        
        // Check in regular courses
        regularCoursesSnapshot.forEach(doc => {
          const courseData = doc.data();
          if (
            (courseData.code && courseData.code === course.code) ||
            (courseData.title || courseData.name) && (courseData.title || courseData.name).includes(course.name)
          ) {
            found = true;
            whereFound = 'courses';
            courseDetails = courseData;
          }
        });
        
        if (found) {
          console.log(`✅ FOUND COURSE: ${course.code} - ${course.name}`);
          console.log(`   Found in: ${whereFound} collection`);
          console.log(`   Details: ${JSON.stringify(courseDetails, null, 2)}`);
        } else {
          console.log(`❌ COURSE NOT FOUND: ${course.code} - ${course.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking courses:", error);
  }
}

// Main function
async function checkProgramsAndCourses() {
  try {
    console.log("Starting check for programs and courses in Firebase...");
    
    // Check programs
    await checkPrograms();
    
    // Check courses
    await checkCourses();
    
    console.log("\nProgram and course check completed!");
  } catch (error) {
    console.error("Error in check:", error);
  }
}

// Run the check
checkProgramsAndCourses(); 