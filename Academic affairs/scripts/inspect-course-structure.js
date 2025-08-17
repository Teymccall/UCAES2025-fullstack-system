const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

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

async function inspectCourseStructure() {
  console.log("Inspecting course document structure...");

  try {
    // First, get the program ID for Environmental Science
    const programsRef = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsRef);
    
    let programId = null;
    programsSnapshot.forEach(doc => {
      const programData = doc.data();
      if (programData.name && programData.name.includes("Environmental Science")) {
        programId = doc.id;
        console.log(`Found program: "${programData.name}" with ID: ${programId}`);
      }
    });

    if (!programId) {
      console.log("Could not find the Environmental Science program ID.");
      return;
    }

    // Get a sample course for Level 100, Semester 1
    const coursesRef = collection(db, 'academic-courses');
    const q = query(
      coursesRef, 
      where("programId", "==", programId),
      where("level", "==", 100),
      where("semester", "==", 1),
      limit(1)
    );
    
    const courseSnapshot = await getDocs(q);
    
    if (courseSnapshot.empty) {
      console.log("No courses found with the specific query.");
      
      // Try a more general query
      const generalQ = query(
        coursesRef,
        where("programId", "==", programId),
        limit(1)
      );
      
      const generalSnapshot = await getDocs(generalQ);
      
      if (generalSnapshot.empty) {
        console.log("No courses found for this program at all.");
        return;
      }
      
      console.log("Found a course with just the programId filter. Here's its structure:");
      const sampleDoc = generalSnapshot.docs[0];
      console.log(JSON.stringify(sampleDoc.data(), null, 2));
      
    } else {
      console.log("Found a matching course. Here's its structure:");
      const sampleDoc = courseSnapshot.docs[0];
      console.log(JSON.stringify(sampleDoc.data(), null, 2));
    }

    // Now get a sample of ALL courses to see their structure
    console.log("\nFetching a sample of 5 random courses to check their structure:");
    const randomCoursesQ = query(collection(db, 'academic-courses'), limit(5));
    const randomCoursesSnapshot = await getDocs(randomCoursesQ);
    
    if (randomCoursesSnapshot.empty) {
      console.log("No courses found in the academic-courses collection at all!");
    } else {
      randomCoursesSnapshot.forEach((doc, index) => {
        console.log(`\nCourse ${index + 1}:`);
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Program ID: ${data.programId || 'NOT SET'}`);
        console.log(`Level: ${data.level || 'NOT SET'}`);
        console.log(`Semester: ${data.semester || 'NOT SET'}`);
        console.log(`Status: ${data.status || 'NOT SET'}`);
        console.log(`Title/Name: ${data.title || data.name || 'NOT SET'}`);
        console.log(`Code: ${data.code || 'NOT SET'}`);
        
        // Check for any fields that might be missing or have unexpected types
        const expectedFields = ['programId', 'level', 'semester', 'status', 'title', 'code'];
        const missingFields = expectedFields.filter(field => data[field] === undefined);
        
        if (missingFields.length > 0) {
          console.log(`Missing fields: ${missingFields.join(', ')}`);
        }
        
        // Check data types
        if (data.level !== undefined && typeof data.level !== 'number') {
          console.log(`WARNING: 'level' is not a number, it's a ${typeof data.level}: ${data.level}`);
        }
        
        if (data.semester !== undefined && typeof data.semester !== 'number') {
          console.log(`WARNING: 'semester' is not a number, it's a ${typeof data.semester}: ${data.semester}`);
        }
      });
    }

  } catch (error) {
    console.error("Error inspecting course structure:", error);
  }
}

inspectCourseStructure(); 